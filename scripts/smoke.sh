#!/usr/bin/env bash
#
# Smoke test for the bookstore inventory API.
# Exercises every implemented endpoint in order, happy paths and error paths,
# printing the HTTP status of each call. Exits non-zero if anything is off.
#
#   bash scripts/smoke.sh [base_url]     # defaults to http://localhost:3000
#
set -u

BASE_URL="${1:-${BASE_URL:-http://localhost:3000}}"
PASSED=0
FAILED=0
BODY="$(mktemp)"
trap 'rm -f "$BODY"' EXIT

# Unique ISBN per run so the script stays repeatable against the same database.
# "978" + a 10-digit epoch is a valid 13-digit ISBN for our format rules.
ISBN="978$(date +%s)"
# Distinct, still-valid ISBNs so the validation cases fail for the reason under test.
ISBN_B="979$(date +%s)"
ISBN_C="977$(date +%s)"

green() { printf '\033[32m%s\033[0m' "$1"; }
red() { printf '\033[31m%s\033[0m' "$1"; }

# request METHOD PATH [JSON_BODY] -> prints the status code, body lands in $BODY
request() {
  method="$1"
  path="$2"
  body="${3:-}"

  if [ -n "$body" ]; then
    curl -s -o "$BODY" -w '%{http_code}' -X "$method" "$BASE_URL$path" \
      -H 'Content-Type: application/json' -d "$body"
  else
    curl -s -o "$BODY" -w '%{http_code}' -X "$method" "$BASE_URL$path"
  fi
}

# expect EXPECTED_STATUS LABEL METHOD PATH [JSON_BODY]
expect() {
  expected="$1"
  label="$2"
  shift 2

  status="$(request "$@")"

  if [ "$status" = "$expected" ]; then
    printf '  %s %-34s %s\n' "$(green OK)" "$label" "$status"
    PASSED=$((PASSED + 1))
  else
    printf '  %s %-34s got %s, expected %s\n' "$(red FAIL)" "$label" "$status" "$expected"
    printf '       %s\n' "$(head -c 300 "$BODY")"
    FAILED=$((FAILED + 1))
  fi
}

# assert_body LABEL PATTERN -- checks the last response body against a regex
assert_body() {
  if grep -qE "$2" "$BODY"; then
    printf '  %s %-34s %s\n' "$(green OK)" "$1" "matched"
    PASSED=$((PASSED + 1))
  else
    printf '  %s %-34s body did not match /%s/\n' "$(red FAIL)" "$1" "$2"
    printf '       %s\n' "$(head -c 300 "$BODY")"
    FAILED=$((FAILED + 1))
  fi
}

json_number() { sed -n "s/.*\"$1\":\([0-9.]*\).*/\1/p" "$BODY" | head -1; }

new_book_payload() {
  cat <<JSON
{
  "title": "$1",
  "author": "Miguel de Cervantes",
  "isbn": "$2",
  "cost_usd": 15.99,
  "stock_quantity": $3,
  "category": "Smoke Test",
  "supplier_country": "ES"
}
JSON
}

echo "Smoke test against $BASE_URL"

if ! curl -s -o /dev/null --max-time 5 "$BASE_URL/books"; then
  echo "  $(red 'API is not reachable') - start the backend first"
  exit 1
fi

echo
echo "CRUD"
expect 201 "create book" POST /books "$(new_book_payload 'El Quijote (smoke)' "$ISBN" 25)"
BOOK_ID="$(json_number id)"
assert_body "isbn stored normalized" "\"isbn\":\"$ISBN\""

expect 200 "list books (paginated)" GET "/books?page=1&limit=10"
assert_body "pagination envelope" '"total":.*"page":.*"limit":.*"total_pages":'

expect 200 "get book by id" GET "/books/$BOOK_ID"
expect 200 "update book" PUT "/books/$BOOK_ID" "$(new_book_payload 'El Quijote (updated)' "$ISBN" 3)"
assert_body "update applied" '"stock_quantity":3'

echo
echo "Searches"
expect 200 "search by category" GET "/books/search?category=Smoke%20Test"
expect 200 "low stock" GET "/books/low-stock?threshold=10"
assert_body "updated book is low stock" "\"id\":$BOOK_ID"

echo
echo "Price calculation"
expect 200 "calculate selling price" POST "/books/$BOOK_ID/calculate-price"
assert_body "breakdown is complete" '"cost_usd":.*"exchange_rate":.*"cost_local":.*"margin_percentage":.*"selling_price_local":.*"currency":.*"rate_source":.*"calculation_timestamp":'
expect 200 "selling price was persisted" GET "/books/$BOOK_ID"
assert_body "selling_price_local is set" '"selling_price_local":[0-9]'

echo
echo "Error cases"
expect 409 "duplicate isbn" POST /books "$(new_book_payload 'Duplicado' "$ISBN" 1)"
assert_body "uniform error shape" '"statusCode":.*"error":.*"message":.*"timestamp":.*"path":'
expect 404 "book not found" GET /books/99999999
expect 400 "non-numeric id" GET /books/abc
expect 400 "negative cost" POST /books "$(new_book_payload 'Coste negativo' "$ISBN_B" 5 | sed 's/15.99/-5/')"
expect 400 "malformed isbn" POST /books "$(new_book_payload 'Isbn corto' '123' 5)"
expect 400 "negative stock" POST /books "$(new_book_payload 'Stock negativo' "$ISBN_C" -3)"
expect 400 "missing required fields" POST /books '{"title":"Incompleto"}'

echo
echo "Cleanup"
expect 204 "delete book" DELETE "/books/$BOOK_ID"
expect 404 "deleted book is gone" GET "/books/$BOOK_ID"

echo
if [ "$FAILED" -eq 0 ]; then
  echo "$(green 'All checks passed') ($PASSED)"
  exit 0
fi

echo "$(red "$FAILED check(s) failed") ($PASSED passed)"
exit 1
