#!/bin/bash

echo "Generating svgs..."
find . -type f -name "*.dot" -exec sh -c 'dot -Tsvg "${0}" -o "${0%.*}.svg"' {} \;

echo "Generating sketchy svgs..."
find . -type f -name "*.svg" -exec sh -c 'git add "${0}"; git diff --cached --exit-code --quiet "${0}" || node /sketchviz/roughen.js "${0}" "${0%.*}.rough.svg"' {} \;

echo "Generating pngs from those svgs..."
find . -type f -name "*.rough.svg" -exec sh -c 'node /sketchviz/node_modules/svgexport/bin/index.js "${0}" "${0%.*.*}.png"' {} \;

echo "Deleting the sketchy svgs..."
find . -type f -name "*.rough.svg" -exec sh -c 'rm "${0}"' {} \;
