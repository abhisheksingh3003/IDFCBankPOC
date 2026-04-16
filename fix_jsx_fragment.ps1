$path = "d:\Product\pekaobankv5\components\ConversationalPlanner.tsx"
$content = Get-Content $path -Encoding UTF8

# The problem:
# Line 1098 (index 1097): "</AnimatePresence>"  <- at col 0, wrong!
#   => This is the phase2 panel's closing AnimatePresence, got de-indented
# Line 1101 (index 1100): "                <AnimatePresence>"  <- booking drawer, correct indent

# The phase2 panel structure should be:
#   ...
#               </AnimatePresence>    <- end phase2 AnimatePresence
#               {/* BOOKING DRAWER */}
#               <AnimatePresence>     <- booking drawer
#               </AnimatePresence >

# Both should be children of the same parent div at indentation level 16 (4 levels of 4 spaces)
# The booking drawer is at 16 spaces (correct).
# The phase2 closing tag at index 1097 is at 0 spaces (wrong - should match booking drawer indentation)

# Fix: re-indent the closing AnimatePresence at index 1097 to match the booking drawer
$content[1097] = "                </AnimatePresence>"

# Also fix: the add experience drawer section (lines after booking drawer)
# Let's also look at lines 1098-1099 (the empty line + comment)
# and move the comment to be inside the same parent
$content[1099] = "                {/* ── BOOKING DRAWER (slides in from right) ── */}"

# Write the fixed content back
Set-Content $path $content -Encoding UTF8
Write-Host "Fixed line 1098 indentation and updated comment"
Write-Host "Line 1097 is now: [$($content[1097])]"
Write-Host "Line 1099 is now: [$($content[1099])]"
Write-Host "Line 1100 is now: [$($content[1100])]"
