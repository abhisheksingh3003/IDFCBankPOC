$path = "d:\Product\pekaobankv5\components\ConversationalPlanner.tsx"
$content = Get-Content $path -Encoding UTF8

# Current structure around lines 1090-1105 (0-indexed 1089-1104):
# 1090: </div>               - essentials item
# 1091: ))}                  - essentials map close
# 1092: </div>               - essentials container
# 1093: )}                   - essentials conditional close
# 1094: </div>               - close some div (scroll area?)
# 1095: </div>               - close outer div  
# 1096: </motion.div>        - close motion.div (phase2 panel)
# 1097: )}                   - close phase2 AnimatePresence conditional
# 1098: </AnimatePresence>   - close phase2 AnimatePresence
# 1099: (empty)
# 1100: comment
# 1101: <AnimatePresence>    - booking drawer start

# The problem: lines 1094-1097 (</div></div></motion.div>)} ) come AFTER </AnimatePresence>
# This means AnimatePresence is being closed inside its own content, which is wrong.
# The correct order should be:
#   </div>          <- close essentials or tabs container
#   </AnimatePresence>  <- close phase2 animate presence   
#   </div>          <- close scroll area
#   </div>          <- close right panel
#   </motion.div>   <- close phase2 motion.div
#   )}              <- close phase2 conditional

# Let's reorder: move </AnimatePresence> from index 1097 to after index 1092
# Then move lines 1094-1097 to after 1098

# Extract the relevant section
$before = $content[0..1092]      # up to index 1092 (line 1093: )})
$animClose = $content[1097]      # </AnimatePresence> (currently at 1097)
$divClosures = $content[1093..1096]  # lines 1094-1097: </div></div></motion.div>)}
$empty = $content[1098]          # empty line
$rest = $content[1099..($content.Length - 1)]  # everything from line 1099 onwards

# New order: before, then </AnimatePresence>, then div closures, then the rest
$newContent = $before + @($animClose) + $divClosures + @($empty) + $rest

Set-Content $path $newContent -Encoding UTF8
Write-Host "Done. New structure around line 1093-1106:"
for ($i = 1090; $i -le 1105; $i++) {
    Write-Host "Line $($i+1): [$($newContent[$i])]"
}
