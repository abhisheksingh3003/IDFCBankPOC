$path = "d:\Product\pekaobankv5\components\ConversationalPlanner.tsx"
$content = Get-Content $path
$prefix = $content[0..1092]
$new_closures = @(
    "                </div>",
    "            </div>",
    "        </motion.div>",
    "    )}",
    "</AnimatePresence>",
    ""
)
$suffix = $content[1100..($content.Length - 1)]
$finalContent = $prefix + $new_closures + $suffix
Set-Content $path $finalContent
