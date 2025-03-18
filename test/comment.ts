import axios from 'axios';

function tsAdd(a: number, b: number): number {
    return a + b;
}


const tsMultiply : Function = (a: number, b: number): number => {
    return a * b;
}


const tsDivide = function<T>(a:number, b:number, c: String, d:T, e:Object,  f:Function) {
    return a * b;
};


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
    
    add(a: number, b: number): number {
        return a + b;
    }
    
    multiply(a: number, b: number): number {
        return a * b;
    }

    async fetchResult(url: string): Promise<number> {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
}