$path = "d:\Product\pekaobankv5\components\ConversationalPlanner.tsx"
$content = Get-Content $path
# Replace line 1042's )} with </div>
$content[1041] = $content[1041] -replace "\)\}", "</div>"
Set-Content $path $content
