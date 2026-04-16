$path = "d:\Product\pekaobankv5\components\ConversationalPlanner.tsx"
$content = Get-Content $path -Encoding UTF8
# Line 1097 (0-indexed): </AnimatePresence> at col 0 -> fix indentation to match sibling
$content[1097] = "                </AnimatePresence>"
Set-Content $path $content -Encoding UTF8
Write-Host "Done. Line 1098 now: [$($content[1097])]"
