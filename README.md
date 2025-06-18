# issue-resolver

> A GitHub App built with [Probot](https://github.com/probot/probot) that Github app that resolves issues by responding with an AI suggestion

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t issue-resolver .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> issue-resolver
```

## Contributing

If you have suggestions for how issue-resolver could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2025 Shagun Singh
