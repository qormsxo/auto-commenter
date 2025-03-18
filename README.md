# auto-commenter 0.1.4

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

```typescript

/**
 * tsAdd
 * @param number a - Description
 * @param number b - Description
 * @returns number - Description
 */

function tsAdd(a: number, b: number): number {
    return a + b;
}


/**
 * tsMultiply
 * @param number a - Description
 * @param number b - Description
 * @returns number - Description
 */

const tsMultiply : Function = (a: number, b: number): number => {
    return a * b;
}


/**
 * tsDivide
 * @param number a - Description
 * @param number b - Description
 * @param String c - Description
 * @param T d - Description
 * @param Object e - Description
 * @param Function f - Description
 * @returns  - Description
 */

const tsDivide = function<T>(a:number, b:number, c: String, d:T, e:Object,  f:Function) {
    return a * b;
};


/**
 * fetchData
 * This function performs an API call using fetch
 * @param string url - Description
 * @returns Promise<number> - Description
 */

const fetchData = async (url: string): Promise<number> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fetch failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

/**
 * fetchWithAxios
 * This function performs an API call using axios
 * @param string url - Description
 * @returns Promise<any> - Description
 */

const fetchWithAxios = async (url: string): Promise<any> => {

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching data with axios:', error);
        throw error;
    }
};

class Calculator {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }
    
    /**
     * add
     * @param number a - Description
     * @param number b - Description
     * @returns number - Description
     */
    
    add(a: number, b: number): number {
        return a + b;
    }
    
    /**
     * multiply
     * @param number a - Description
     * @param number b - Description
     * @returns number - Description
     */
    
    multiply(a: number, b: number): number {
        return a * b;
    }

    /**
     * fetchResult
     * This function performs an API call using fetch
     * @param string url - Description
     * @returns Promise<number> - Description
     */
    
    async fetchResult(url: string): Promise<number> {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
}

```