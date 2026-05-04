
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Binary search implementation
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  const steps = [];

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = arr[mid];

    steps.push({
      left,
      right,
      mid,
      midValue,
      target,
      status: midValue === target ? "found" : midValue < target ? "search_right" : "search_left",
    });

    if (midValue === target) {
      return { found: true, index: mid, steps };
    } else if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { found: false, index: -1, steps };
}

// Visualize the search process
function visualizeSearch(arr, result) {
  console.log("\n=== BINARY SEARCH VISUALIZATION ===\n");
  console.log(`Array: [${arr.join(", ")}]`);
  console.log(`Target: ${result.steps[0].target}`);
  console.log(`\nSearch Steps:`);

  result.steps.forEach((step, index) => {
    const arrayVisualization = arr.map((val, idx) => {
      if (idx === step.mid) return `[${val}]`;
      if (idx >= step.left && idx <= step.right) return ` ${val} `;
      return "   ";
    });

    console.log(`\nStep ${index + 1}:`);
    console.log(`  Array segment: ${arrayVisualization.join("")}`);
    console.log(`  Left: ${step.left}, Right: ${step.right}, Mid: ${step.mid}`);
    console.log(`  Mid Value: ${step.midValue}, Target: ${step.target}`);

    if (step.status === "found") {
      console.log(`  ✓ FOUND! Target ${step.target} at index ${step.mid}`);
    } else if (step.status === "search_right") {
      console.log(`  → Mid value (${step.midValue}) < Target (${step.target}), search right`);
    } else {
      console.log(`  ← Mid value (${step.midValue}) > Target (${step.target}), search left`);
    }
  });

  console.log(`\n=== RESULT ===`);
  if (result.found) {
    console.log(`✓ Element found at index ${result.index}`);
  } else {
    console.log(`✗ Element not found in array`);
  }
  console.log(`Total steps: ${result.steps.length}`);
  console.log(`Time Complexity: O(log n) - ${Math.ceil(Math.log2(arr.length))} max steps for array of size ${arr.length}\n`);
}

// Interactive demo with Claude
async function interactiveDemo() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

  console.log("=== BINARY SEARCH ALGORITHM WITH CLAUDE ===\n");

  // Example arrays for demonstration
  const examples = [
    { arr: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target: 7 },
    { arr: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20], target: 14 },
    { arr: [10, 20, 30, 40, 50, 60, 70, 80, 90], target: 25 },
  ];

  console.log("Running predefined examples...\n");

  for (const example of examples) {
    const result = binarySearch(example.arr, example.target);
    visualizeSearch(example.arr, result);

    // Use Claude to explain the search process
    const messages = [
      {
        role: "user",
        content: `I performed a binary search on the array [${example.arr.join(", ")}] looking for the value ${example.target}. 
        The search took ${result.steps.length} steps. 
        ${result.found ? `The element was found at index ${result.index}.` : "The element was not found."}
        Please provide a brief explanation of why binary search is efficient for this operation.`,
      },
    ];

    console.log("Claude's Analysis:");
    console.log("------------------");

    const stream = await client.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: messages,
    });

    process.stdout.write("Claude: ");
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        process.stdout.write(chunk.delta.text);
      }
    }
    console.log("\n");
  }

  // Allow user to test with custom input
  const userInput = await question("Would you like to test with custom values? (yes/no): ");

  if (userInput.toLowerCase() === "yes") {
    const arrayInput = await question("Enter sorted array values separated by commas (e.g., 1,2,3,4,5): ");
    const targetInput = await question("Enter the target value to search: ");

    try {
      const customArr = arrayInput.split(",").map((x) => parseInt(x.trim()));
      const customTarget = parseInt(targetInput);

      // Verify array is sorted
      const isSorted = customArr.every