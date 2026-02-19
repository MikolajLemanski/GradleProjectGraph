# GradleProjectGraph

A simple website to compute and visualize Gradle project dependency graphs from GitHub repositories.

## Features

- Analyze Gradle dependencies from any public GitHub repository
- Supports both `build.gradle` and `build.gradle.kts` files
- Two-page user flow: repository input page and graph result page
- Clean, modern interface with responsive design
- Categorizes dependencies by type (implementation, testImplementation, api, etc.)

## Running Locally

To run the website locally on your machine:

1. Clone this repository:
   ```bash
   git clone https://github.com/MikolajLemanski/GradleProjectGraph.git
   cd GradleProjectGraph
   ```

2. Open `index.html` in your web browser:
   - **Option 1**: Double-click `index.html` in your file explorer
   - **Option 2**: Use a local web server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Python 2
     python -m SimpleHTTPServer 8000
     
     # Using Node.js (requires npx)
     npx serve
     ```
   - Then open your browser to `http://localhost:8000`

3. Enter a GitHub repository URL (e.g., `https://github.com/spring-projects/spring-boot`) and click "Analyze Dependencies"

## Deploying to GitHub Pages

To deploy this website to GitHub Pages:

1. **Enable GitHub Pages** in your repository:
   - Go to your repository settings on GitHub
   - Navigate to **Pages** in the left sidebar
   - Under **Source**, select the branch you want to deploy (e.g., `main`)
   - Click **Save**

2. **Access your website**:
   - Your site will be published at: `https://mikolajlemanski.github.io/GradleProjectGraph/`
   - It may take a few minutes for the site to be available

3. **Optional - Custom Domain**:
   - In the Pages settings, you can add a custom domain if you have one
   - Follow GitHub's instructions for DNS configuration

## Usage

1. On the input page, enter the full GitHub repository URL
2. Optionally specify a branch (defaults to `main`)
3. Click "Analyze Dependencies"
4. On the result page, view the dependency graph organized by dependency type

## Limitations

- Only works with public GitHub repositories
- Parses dependencies from root `build.gradle` or `build.gradle.kts` files
- GitHub API rate limits apply (60 requests per hour for unauthenticated requests)

## License

See [LICENSE](LICENSE) file for details.