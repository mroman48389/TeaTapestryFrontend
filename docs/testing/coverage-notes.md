# Coverage Script Notes

> The 'test:coverage' script clears Jest's cache before generating coverage:
> 
>     jest --clearCache && jest --coverage --no-cache
> 
> Jest caches transformed files and sourcemaps. When the transform pipeline changes (such as switching from ts-jest to babel-jest, enabling V8 coverage, or adding Istanbul ignore directives), stale cached artifacts can cause incorrect coverage mapping. An example is the mangled "Iif" artifacts that appear inside React hook closures.
> 
> Clearing the cache ensures:
> 
> - fresh transforms  
> - correct sourcemaps  
> - accurate line/statement coverage  
> - no leftover instrumentation  
> - stable CI behavior  
> 
> This script automates the two-step process so developers never need to remember it manually.

# Known V8 Coverage False Negatives 

> React hook closures ('useCallback', 'useMemo', 'useEffect') may show incorrect line coverage due to sourcemap drift. These lines are executed, but V8 coverage cannot always map the closure body back to the original TSX source. Occurrences are marked with the comment 'false negative for coverage'.

# Coverage Gutters (by ryanluker) VS Code Extension

> This extension can be used to see which lines are actually executed by tests. Reads Jest's lcov.info and overlays coverage directly in the editor where 
> 
> - green = covered
> - red = uncovered
> - yellow = partially covered

> Do Ctrl + Shift + P and select the desired Coverage Gutters option, such as Watch.