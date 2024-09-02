# auto-commenter 0.1.2

A CLI tool that automatically adds comments to functions in JavaScript files.

## Installation

To install globally:

```bash
npm install -g auto-commenter
```

``` bash
auto-commenter -d {dirPath}

auto-commenter --directory {dirPath}
```

Example 

``` bash 
auto-commenter --directory .\test
```

```javascript

/**
 * add
 * @param a - Description
 * @param b - Description
 * @returns - Description
 */

function add(a, b) {
    return a + b;
}


/**
 * multiply
 * @param a - Description
 * @param b - Description
 * @returns - Description
 */

const multiply = function(a, b) {
    return a * b;
};


/**
 * divide
 * @param a - Description
 * @param b - Description
 * @returns - Description
 */

const divide = (a, b) => a / b;

```