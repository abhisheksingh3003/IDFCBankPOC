$path = "d:\Product\pekaobankv5\components\ConversationalPlanner.tsx"
$content = Get-Content $path
$content[1041] = $content[1041] -replace "</div>", ")}"
Set-Content $path $content
