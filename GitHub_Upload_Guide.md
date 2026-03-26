# How to Upload Your Project to GitHub (with Images)

Here is a step-by-step walkthrough on how to upload this entire project—including your code files, reports, and your image assets—to GitHub.

## Step 1: Create a Repository on GitHub
1. Log in to your [GitHub account](https://github.com/).
2. Click the **+** icon in the top right corner and select **New repository**.
3. Name your repository (e.g., `dns-spoofing-lab`).
4. Add an optional description.
5. Choose **Public** or **Private**.
6. **IMPORTANT:** Do *not* check the boxes for "Add a README file", "Add .gitignore", or "Choose a license" (since we already have a `README.md` locally).
7. Click the green **Create repository** button.

## Step 2: Initialize Git Locally
Open your terminal (Command Prompt, PowerShell, or Git Bash) and navigate to your project folder using this command:
```bash
cd "e:\your-directory\DNS Spoofing & HTTPS Defense"
```
Initialize the Git repository:
```bash
git init
```

## Step 3: Add Your Files and Images
You want to include all your code, HTML, CSS, Markdown, and *especially* the `report_assets/` and `spoofed_page/` folders containing your images.

To add everything in the current folder:
```bash
git add .
```
*(Note: As long as your images are inside this project folder, `git add .` will automatically stage them for upload.)*

## Step 4: Commit Your Changes
Save these files to your local repository history by creating a commit:
```bash
git commit -m "Initial commit: Added DNS Spoofing Lab files, README, and image assets"
```

## Step 5: Connect and Push to GitHub
On the GitHub repository page you created in Step 1, look for the section titled **"…or push an existing repository from the command line"**. Copy those commands. They will look exactly like this:

```bash
# Set the default branch to 'main'
git branch -M main

# Link your local folder to your GitHub repository (REPLACE WITH YOUR URL!)
git remote add origin https://github.com/yourusername/dns-spoofing-lab.git

# Push your code and images to GitHub
git push -u origin main
```

---

## 📷 Step 6: How to Display Images in Your README
Since you want to upload and show images, here is how you can make them visible directly on your GitHub repository's main page.

### Method A: Using Relative Paths (Since they are uploaded)
If you have an image inside the `report_assets` folder (for example, `section1_initial_1774462356592.png`), you can display it in your `README.md` by opening the README file and adding this snippet:
```markdown
![Network Topology Screenshot](report_assets/section1_initial_1774462356592.png)
```
*(Because you pushed the whole folder to GitHub, GitHub automatically knows how to find relative paths and will render the image!)*

### Method B: Drag-and-Drop on the GitHub Website
If you prefer adding images to your README *after* uploading the code:
1. Go to your repository page on GitHub.
2. Click on the `README.md` file, then click the **Pencil icon ✏️** in the top right to edit it.
3. Simply **Drag and Drop** your image file from your computer directly into the text editor in the browser.
4. GitHub will automatically upload the image to their servers and generate the correct Markdown code to display it.
5. Scroll down to the bottom and click **Commit changes**.
