<!-- BEGIN:nextjs-agent-rules -->
# Next.js guidance

Do not read bundled Next.js documentation from node_modules. If Next.js reference is needed, use the existing project source code, TypeScript typings, and package APIs. Do not access local Next.js documentation files, process bundled Markdown documentation from node_modules, or retry missing documentation files.

If a referenced file is missing or returns ENOENT, log it once, do not retry, do not try similar paths, and continue with the task.
<!-- END:nextjs-agent-rules -->
