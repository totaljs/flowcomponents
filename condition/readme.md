# Condition

A condition has to return an `index` for re-send current data to the specific output. Return values like `null`, `undefined` or `false` cancels re-sending. `true` sends data to all outputs.