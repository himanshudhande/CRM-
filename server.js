// Custom Next.js server for Hostinger's shared-hosting "Node.js App" feature.
// That hosting runs on Phusion Passenger, which expects a plain startup file
// that listens on process.env.PORT -- `next start` alone doesn't fit that
// model, so this wraps Next's programmatic API the way Next.js's own docs
// recommend for custom-server deployments.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
