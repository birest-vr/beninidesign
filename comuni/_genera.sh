#!/usr/bin/env bash
# Genera le pagine comune da _dati.txt + _template.html
# Uso:  bash comuni/_genera.sh     (dalla radice del sito)
# Per aggiungere un comune: aggiungi una riga a _dati.txt e rilancia.
# Formato riga:  slug|Nome|Zona|km|Descrizione del paese|Descrizione delle case

set -u
cd "$(dirname "$0")"

TPL="$(cat _template.html)"
DATA="_dati.txt"

# --- prima passata: raccoglie slug e nome per zona (per i link "vicini") ---
declare -A ZONA_LIST
while IFS='|' read -r slug nome zona km desc case_; do
  [ -z "${slug:-}" ] && continue
  case "$slug" in \#*) continue ;; esac
  ZONA_LIST["$zona"]="${ZONA_LIST[$zona]:-}<li><a href=\"$slug.html\">$nome</a></li>"$'\n'
done < "$DATA"

# --- seconda passata: scrive le pagine ---
n=0
while IFS='|' read -r slug nome zona km desc case_; do
  [ -z "${slug:-}" ] && continue
  case "$slug" in \#*) continue ;; esac

  # elenco vicini = altri comuni della stessa zona, escluso se stesso
  vicini="$(printf '%s' "${ZONA_LIST[$zona]}" | grep -v "\"$slug.html\"" | head -14 | tr -d '\n')"
  [ -z "$vicini" ] && vicini="<li><a href=\"index.html\">Vedi tutte le zone servite</a></li>"

  # riga distanza e nota trasferta
  if [ "$km" = "centro" ]; then
    dist="Verona città"
    trasf="Nessun costo di trasferta."
  else
    dist="$km da Verona"
    n_km="${km% km}"
    if [ "$n_km" -le 30 ] 2>/dev/null; then
      trasf="Entro 30 km da Verona centro non si aggiungono costi di trasferta."
    else
      trasf="Oltre i 30 km da Verona centro si aggiunge un rimborso chilometrico di 0,60 €/km, sempre indicato nel preventivo prima della visita."
    fi
  fi

  out="$TPL"
  out="${out//\{\{SLUG\}\}/$slug}"
  out="${out//\{\{NOME\}\}/$nome}"
  out="${out//\{\{ZONA\}\}/$zona}"
  out="${out//\{\{DIST\}\}/$dist}"
  out="${out//\{\{TRASFERTA\}\}/$trasf}"
  out="${out//\{\{DESC\}\}/$desc}"
  out="${out//\{\{CASE\}\}/$case_}"
  out="${out//\{\{VICINI\}\}/$vicini}"

  printf '%s\n' "$out" > "$slug.html"
  n=$((n+1))
done < "$DATA"

echo "Generate $n pagine comune."
