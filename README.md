# Epilog Lexers & Parsers

A library with lexers and parsers for the Epilog programming language.

## Installation (package is not published on NPM yet, so the following will not work)

```bash
bun add epilog-lexers-parsers
```

## Usage

The library exports four main functions:

### Lexers

```typescript
import { datasetLexer, rulesetLexer } from "index.js"; // or, if Typescript package is used: "epilog-lexers-parsers"; "epilog-lexers-parsers";

// Tokenize a dataset
const datasetTokens = datasetLexer("father(john, mary).");
// Returns array of tokens: [{type: "CONSTANT", content: "father"}, {type: "LEFT_PAREN"}, ...]

// Tokenize a ruleset
const rulesetTokens = rulesetLexer("ancestor(X, Y) :- parent(X, Y).");
// Returns array of tokens: [{type: "CONSTANT", content: "ancestor"}, {type: "LEFT_PAREN"}, ...]
```

### Parsers

```typescript
import { parseDataset, parseRuleset } from "index.js"; // or, if Typescript package is used: "epilog-lexers-parsers";

// Parse a dataset (requires tokens from datasetLexer)
const datasetAst = parseDataset(datasetTokens);
// Returns AST with type "DATASET" and children representing facts

// Parse a ruleset (requires tokens from rulesetLexer)
const rulesetAst = parseRuleset(rulesetTokens);
// Returns AST with type "RULESET" and children representing rules, operations, and definitions
```

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime
- Git

### Setup

```bash
# Clone the repository
git clone [repository-url]
cd epilog-lexers-parsers

# Install dependencies
bun install
```

### Running Tests

```bash
bun test
```

### Creating a Release

To create a new release:

1. Make sure all your changes are committed and pushed
2. Create and push a new tag with semantic versioning:
   ```bash
   git tag v1.0.0  # Replace with appropriate version
   git push origin v1.0.0
   ```
3. The GitHub Action will automatically:
   - Run all tests
   - Build the project
   - Create a new GitHub release
   - Upload build artifacts

The release will be available in the GitHub repository's Releases section.

## License

This is “work made for hire” within the meaning of the Copyright Act of 1976, as amended from time to time. The Software is the sole property of The Board of Trustees of the Leland Stanford Junior University. It was initially developed by [Paul F. Welter](https://www.paulwelter.com) ([bayshore AI](https://www.bayshore.ai)).
