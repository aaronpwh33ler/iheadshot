# Terminal Command Preferences

## CRITICAL RULES FOR ALL TERMINAL COMMANDS

1. **ALWAYS use full absolute paths** - Never assume the user is in any particular directory
2. **ALWAYS combine commands with `&&`** - Include `cd` to the project folder first
3. **ALWAYS wrap commands in code blocks** - So they can be directly copy-pasted
4. **NEVER explain what the command does inline** - Just give the command
5. **NEVER use `~` shortcuts without the full path** - Use the actual home directory path when known

## Standard Project Path

The default project path for this codebase is:
```
~/AI\ Headshot\ Generator/headshot-ai
```

## Command Format Template

Every terminal command should follow this format:

```bash
cd ~/AI\ Headshot\ Generator/headshot-ai && [YOUR COMMAND HERE]
```

## Examples

### Git operations
```bash
cd ~/AI\ Headshot\ Generator/headshot-ai && git status
```

```bash
cd ~/AI\ Headshot\ Generator/headshot-ai && git add . && git commit -m "message" && git push origin main
```

### NPM operations
```bash
cd ~/AI\ Headshot\ Generator/headshot-ai && npm install package-name
```

```bash
cd ~/AI\ Headshot\ Generator/headshot-ai && npm run dev
```

### Multiple sequential commands
```bash
cd ~/AI\ Headshot\ Generator/headshot-ai && rm -f .git/index.lock .git/HEAD.lock && git add . && git commit -m "fix" && git push origin main
```

## What NOT to do

❌ Don't say "run `git push`" without the full path
❌ Don't assume they're already in the folder
❌ Don't give commands in prose like "navigate to the folder and then..."
❌ Don't split commands across multiple code blocks when they should run together
❌ Don't use relative paths like `./src/file.ts`

## What TO do

✅ Give one complete code block they can copy-paste
✅ Always start with `cd` to the project folder
✅ Chain all related commands with `&&`
✅ Use absolute paths for everything
