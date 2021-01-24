function useHook (): void { console.log("hook") }

function ComponentWithHook (): void { useHook() }

console.log(ComponentWithHook)
