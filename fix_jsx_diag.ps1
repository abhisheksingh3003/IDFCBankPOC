$path = "d:\Product\pekaobankv5\components\ConversationalPlanner.tsx"
$content = Get-Content $path -Encoding UTF8

# Find line indices (0-based) for the two adjacent AnimatePresence blocks
# Line 1098 (index 1097): </AnimatePresence>   <- end of phase2 panel
# Line 1101 (index 1100): <AnimatePresence>    <- start of booking drawer

# We need to wrap BOTH in a fragment. But actually the cleanest fix is:
# The phase2 AnimatePresence already has wrapping parent containers (motion.div etc.)
# The problem is the two AnimatePresence blocks are siblings in the same return.

# Fix: wrap both AnimatePresence blocks in <> ... </>
# Find the line right before the first of the two siblings
# The structure should be like:
#   return (
#     <SomeDiv>
#       ...
#       </AnimatePresence>   <- line 1097 (0-based)
#                            <- line 1098 (empty)
#       {/* BOOKING DRAWER */}   <- line 1099
#       <AnimatePresence>   <- line 1100
#       ...
#       </AnimatePresence > <- line 1255
#       </div>              <- line 1256
#       </div >             <- line 1257
#     );

# The approach: find the line index of the first </AnimatePresence> in this region
$firstClose = -1
$bookingDrawerOpen = -1
for ($i = 1090; $i -lt 1110; $i++) {
    if ($content[$i] -match "^</AnimatePresence>" -and $firstClose -eq -1) {
        $firstClose = $i
        Write-Host "Found first closing AnimatePresence at line $($i+1): [$($content[$i])]"
    }
    if ($content[$i] -match "^\s+<AnimatePresence>" -and $bookingDrawerOpen -eq -1) {
        $bookingDrawerOpen = $i
        Write-Host "Found booking drawer AnimatePresence at line $($i+1): [$($content[$i])]"
    }
}

# Now go further back to find the opening of the phase2 AnimatePresence
# so we can wrap both inside <>...</>
# Simple fix: insert <> before the phase2 AnimatePresence and </> after the booking drawer's </AnimatePresence>

# Actually the simpler fix: just ensure both AnimatePresence blocks are inside the same parent div
# by fixing the indentation discrepancy -- the first </AnimatePresence> at root level is wrong
# it should be inside the main return div

# Let's look at what contains the two AnimatePresence blocks
# Looking at the structure, the fix is to change line 1098 (0-based 1097)
# from "</AnimatePresence>" to "            </AnimatePresence>"
# and wrap the booking drawer too

# Actually the REAL problem: the `</AnimatePresence>` was placed at column 0 (no indentation)
# when it should be inside the main component div. Let's fix by adding correct indentation
# and inserting a wrapping fragment.

# The fix: 
# Before line 1097 (first </AnimatePresence>), insert a fragment opener <> at the appropriate level
# and after line 1255 (last </AnimatePresence >), insert </> 
# But actually the existing structure already has them inside a return, so we just need
# to wrap the two adjacent root-level items.

# Look at what's at lines 1255, 1256, 1257
for ($i = 1253; $i -lt 1263; $i++) {
    Write-Host "Line $($i+1): [$($content[$i])]"
}
