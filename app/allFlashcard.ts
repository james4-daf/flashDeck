export const allFlashcards = [
  {
    question: 'What are arrow functions?',
    answer:
      'Arrow functions are a concise way to write functions and do not bind their own `this`.',
    category: 'ES6+ Features',
    type: 'basic',
  },
  {
    question: 'What is the use of the optional chaining operator (?.)?',
    answer: 'It allows safe access to deeply nested object properties.',
    category: 'Operators',
    type: 'basic',
  },
  {
    question: 'What is a Promise?',
    answer:
      'A Promise is an object representing the eventual completion or failure of an asynchronous operation.',
    category: 'Asynchronous JS',
    type: 'basic',
  },
  {
    question: 'What does the typeof operator return for null?',
    answer:
      "`typeof null` returns 'object' due to a long-standing bug in JavaScript.",
    category: 'Operators',
    type: 'basic',
  },
  {
    question: 'What is the call stack?',
    answer:
      'The call stack is a data structure that keeps track of function calls in a program.',
    category: 'Execution Context',
    type: 'basic',
  },
  {
    question: 'What are execution contexts?',
    answer:
      'Execution contexts are environments where JavaScript code is evaluated and executed.',
    category: 'Execution Context',
    type: 'basic',
  },
  {
    question: 'What are default parameters?',
    answer:
      'They allow function parameters to have default values if no value is passed.',
    category: 'ES6+ Features',
    type: 'basic',
  },
  {
    question: 'What is the global execution context?',
    answer:
      "It's the default context in which code is executed when the script first runs.",
    category: 'Execution Context',
    type: 'basic',
  },
  {
    question: 'What is the event loop?',
    answer:
      'The event loop is a mechanism that handles asynchronous callbacks in JavaScript.',
    category: 'Asynchronous JS',
    type: 'basic',
  },
  {
    question: 'What is hoisting in JavaScript?',
    answer:
      "Hoisting is JavaScript's behavior of moving declarations to the top of their scope before code execution.",
    category: 'Execution Context',
    type: 'basic',
  },
  {
    question: 'How do you clone an object in JavaScript?',
    answer: 'You can use structuredClone, Object.assign, or spread syntax.',
    category: 'Objects & Arrays',
    type: 'basic',
  },
  {
    question: 'What does the this keyword refer to in JavaScript?',
    answer:
      '`this` refers to the object that is executing the current function. Its value depends on how the function is called.',
    category: 'Functions & Context',
    type: 'basic',
  },
  {
    question: 'What is destructuring in JavaScript?',
    answer:
      'Destructuring allows unpacking values from arrays or properties from objects into variables.',
    category: 'Objects & Arrays',
    type: 'basic',
  },
  {
    question: 'What is the typeof operator?',
    answer:
      '`typeof` returns a string indicating the type of the unevaluated operand.',
    category: 'Data Types & Coercion',
    type: 'basic',
  },
  {
    question: 'What are truthy and falsy values in JavaScript?',
    answer:
      "Truthy values evaluate to true in a boolean context; falsy values include `0`, `''`, `null`, `undefined`, `NaN`, `false`.",
    category: 'Data Types & Coercion',
    type: 'basic',
  },
  {
    question: 'What is the difference between let and const?',
    answer:
      '`let` allows reassignment, `const` does not. Both are block-scoped.',
    category: 'ES6+ Features',
    type: 'basic',
  },
  {
    question: 'What is a closure?',
    answer:
      'A closure is a function that retains access to its lexical scope even when executed outside that scope.',
    category: 'Functions & Context',
    type: 'basic',
  },
  {
    question: 'What is the difference between == and ===?',
    answer:
      '`==` checks for equality with type coercion, `===` checks for both value and type.',
    category: 'Operators',
    type: 'basic',
  },
  {
    question: 'What are modules in JavaScript?',
    answer:
      'Modules allow code to be split into reusable pieces using `export` and `import`.',
    category: 'ES6+ Features',
    type: 'basic',
  },
  {
    question: 'What are arrow functions?',
    answer:
      'Arrow functions are a concise way to write functions and do not bind their own `this`.',
    category: 'ES6+ Features',
    type: 'basic',
  },
  {
    question: 'What is a higher-order function?',
    answer:
      'A function that takes another function as an argument or returns a function.',
    category: 'Functions & Context',
    type: 'basic',
  },
  {
    question: 'How do you merge two arrays?',
    answer: 'Use spread syntax: `[...arr1, ...arr2]` or `concat()` method.',
    category: 'Objects & Arrays',
    type: 'basic',
  },
  {
    question: 'What is a template literal?',
    answer:
      'A string syntax using backticks that allows embedded expressions like `${value}`.',
    category: 'ES6+ Features',
    type: 'basic',
  },
  {
    question: 'What is type coercion?',
    answer:
      'Type coercion is the automatic or implicit conversion of values from one type to another.',
    category: 'Data Types & Coercion',
    type: 'basic',
  },
  {
    question: 'What is variable shadowing?',
    answer:
      'Variable shadowing occurs when a variable declared within a certain scope has the same name as a variable in an outer scope.',
    category: 'Variables & Scope',
    type: 'basic',
  },
  {
    question:
      'What is the difference between function declaration and function expression?',
    answer: 'Function declarations are hoisted; expressions are not.',
    category: 'Functions & Context',
    type: 'basic',
  },
  {
    question: 'What is the difference between null and undefined?',
    answer:
      '`undefined` means a variable has been declared but not assigned. `null` is an assignment value representing no value.',
    category: 'Data Types & Coercion',
    type: 'basic',
  },
  {
    question: 'Can you re-declare a variable with let or const?',
    answer: '`let` and `const` do not allow re-declaration in the same scope.',
    category: 'Variables & Scope',
    type: 'basic',
  },
  {
    question: 'What is the spread operator?',
    answer: 'It expands iterable objects into individual elements.',
    category: 'Operators',
    type: 'basic',
  },
  {
    question: 'What is block scope?',
    answer:
      'Block scope means a variable declared inside a block is only accessible within that block.',
    category: 'Variables & Scope',
    type: 'basic',
  },
  {
    question: 'What is async/await?',
    answer:
      '`async` functions return a Promise. `await` pauses the function execution until the Promise resolves.',
    category: 'Asynchronous JS',
    type: 'basic',
  },
  {
    question: 'What is destructuring assignment?',
    answer:
      'A syntax for extracting values from arrays or objects into distinct variables.',
    category: 'ES6+ Features',
    type: 'basic',
  },
  {
    question: 'What is the difference between map and forEach?',
    answer:
      '`map` returns a new array with results, `forEach` does not return anything.',
    category: 'Objects & Arrays',
    type: 'basic',
  },
  {
    question: 'What is the difference between setTimeout and setInterval?',
    answer:
      '`setTimeout` runs once after a delay, `setInterval` runs repeatedly at a given interval.',
    category: 'Asynchronous JS',
    type: 'basic',
  },
  {
    question:
      'What is the difference between var, let, and const in JavaScript?',
    answer:
      '`var` is function-scoped and can be re-declared; `let` and `const` are block-scoped. `let` can be reassigned, while `const` cannot.',
    category: 'Variables & Scope',
    type: 'basic',
  },
  {
    answer: 'The object that the function is called on',
    category: 'JavaScript Objects',
    question: "What does the 'this' keyword refer to in JavaScript?",
    type: 'basic',
  },
  {
    answer: ['pop'],
    category: 'JavaScript Arrays',
    options: ['push', 'pop', 'shift', 'unshift'],
    question: 'Which method removes the last element from an array?',
    type: 'multiple_choice',
  },
  {
    answer: ['string', 'number', 'boolean'],
    category: 'JavaScript Basics',
    options: ['string', 'number', 'boolean', 'object', 'array'],
    question: 'Which of these are JavaScript primitive types?',
    type: 'multiple_choice',
  },
  {
    answer: 'To add state to functional components',
    category: 'React Hooks',
    question: 'What is the purpose of the useState hook in React?',
    type: 'basic',
  },
  {
    answer:
      "Truthy values evaluate to true in a boolean context; falsy values (like `0`, `''`, `null`, `undefined`, `NaN`, `false`) evaluate to false.",
    category: 'Data Types & Coercion',
    question: 'What are truthy and falsy values in JavaScript?',
    type: 'basic',
  },
  {
    answer: 'true',
    category: 'JavaScript Basics',
    question: 'JavaScript is case-sensitive',
    type: 'true_false',
  },
  {
    answer: 'let has block scope while var has function scope',
    category: 'Variables',
    question: 'What is the difference between let and var in JavaScript?',
    type: 'basic',
  },
];
