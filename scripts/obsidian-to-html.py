import re
import argparse
from pathlib import Path

from markdown_it import MarkdownIt
from mdit_py_plugins.footnote import footnote_plugin
from mdit_py_plugins.tasklists import tasklists_plugin
from bs4 import BeautifulSoup

# --- Pre-processing: Handle Obsidian-specific syntax (No changes here) ---

def slugify(text):
    """Converts text to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[\s/]+', '-', text)  # Replace spaces and slashes with hyphens
    text = re.sub(r'[^\w\.\-]+', '', text) # Remove non-alphanumeric characters except dots and hyphens
    return text

def preprocess_obsidian_markdown(markdown_text: str, source_path: Path) -> str:
    """
    Applies regex substitutions to convert Obsidian syntax to standard Markdown
    or HTML before the main conversion.
    """
    # 1. Comments: %%...%% -> remove
    markdown_text = re.sub(r'%%(.+?)%%', '', markdown_text, flags=re.DOTALL)

    # 2. Highlights: ==...== -> <mark>...</mark>
    markdown_text = re.sub(r'==(.+?)==', r'<mark>\1</mark>', markdown_text)

    # 3. Wikilinks: [[Link|Alias]] or [[Link]]
    def wikilink_replacer(match):
        full_match = match.group(0)
        link_target = match.group(1).strip()
        alias = match.group(2) or link_target

        if '#' in link_target:
            link_target = link_target.split('#')[0]

        if not re.search(r'\.\w+$', link_target):
            href = slugify(link_target) + ".html"
        else:
            href = slugify(link_target)

        return f'<a href="{href}" class="internal-link">{alias.strip()}</a>'

    markdown_text = re.sub(r'\[\[([^|\]]+?)(?:\|([^\]]+?))?\]\]', wikilink_replacer, markdown_text)

    # 4. Embeds/Transclusions: ![[file.ext|dims]]
    def embed_replacer(match):
        link_target = match.group(1).strip()
        dims = match.group(2)
        file_path = link_target
        
        if any(link_target.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg']):
            style = ""
            if dims:
                if 'x' in dims:
                    width, height = dims.split('x')
                    style = f'width: {width}px; height: {height}px;'
                else:
                    style = f'width: {dims}px;'
            return f'<img src="{file_path}" alt="{link_target}" style="{style}">'
        elif any(link_target.lower().endswith(ext) for ext in ['.mp4', '.webm', '.ogv']):
            return f'<video src="{file_path}" controls></video>'
        elif any(link_target.lower().endswith(ext) for ext in ['.mp3', '.wav', '.ogg']):
            return f'<audio src="{file_path}" controls></audio>'
        elif link_target.lower().endswith('.md'):
            try:
                transcluded_path = source_path.parent / link_target
                with open(transcluded_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                processed_content = preprocess_obsidian_markdown(content, transcluded_path)
                return f'<div class="transclusion">{md_converter().render(processed_content)}</div>'
            except FileNotFoundError:
                 return f'<div class="transclusion-error">File not found: {link_target}</div>'
        else:
            return f'<a href="{file_path}" class="internal-embed">Embed: {link_target}</a>'

    markdown_text = re.sub(r'!\[\[([^|\]]+?)(?:\|([^\]]+?))?\]\]', embed_replacer, markdown_text)

    return markdown_text

# --- Main Markdown to HTML Conversion (No changes here) ---

def md_converter():
    md = (
        MarkdownIt('gfm-like')
        .use(footnote_plugin)
        .use(tasklists_plugin, enabled=True)
        .enable('table')
    )
    return md

# --- Post-processing: Handle Callouts (No changes here) ---

def postprocess_html(html_content: str) -> str:
    soup = BeautifulSoup(html_content, 'html.parser')
    for bq in soup.find_all('blockquote'):
        p_tag = bq.find('p')
        if not p_tag:
            continue
        callout_match = re.match(r'\[!(?P<type>\w+)\](?:\s*(?P<title>.*))?', p_tag.get_text(strip=True))
        if callout_match:
            callout_type = callout_match.group('type').lower()
            callout_title = callout_match.group('title') or callout_type.capitalize()
            callout_div = soup.new_tag('div', **{'class': f'callout callout-{callout_type}'})
            title_div = soup.new_tag('div', **{'class': 'callout-title'})
            title_div.string = callout_title
            callout_div.append(title_div)
            content_div = soup.new_tag('div', **{'class': 'callout-content'})
            p_tag.string = re.sub(r'\[!(\w+)\](.*)', '', p_tag.decode_contents(), count=1).strip()
            for element in bq.contents:
                content_div.append(element)
            callout_div.append(content_div)
            bq.replace_with(callout_div)
    return str(soup)

# --- HTML Template and Styling (MODIFIED SECTION) ---

def get_html_template(title: str, body: str) -> str:
    """Wraps the HTML body in your specific document template."""
    
    # CSS styles from the previous script, adapted for a self-contained file.
    # The font-family is updated to use 'Noto Serif' as requested in your template.
    css_style = """
    :root {
        --bg-color: #ffffff; --text-color: #212121; --link-color: #0e639c;
        --mark-bg: #fceb90; --code-bg: #f0f0f0; --border-color: #dddddd;
        --callout-note-bg: #e7f4fd; --callout-note-border: #63b3ed;
        --callout-warning-bg: #fffaf0; --callout-warning-border: #f6ad55;
    }
    @media (prefers-color-scheme: dark) {
        :root {
            --bg-color: #1a1a1a; --text-color: #e0e0e0; --link-color: #63b3ed;
            --mark-bg: #b7950b; --code-bg: #2d2d2d; --border-color: #444444;
            --callout-note-bg: #2c5282; --callout-note-border: #63b3ed;
            --callout-warning-bg: #975a16; --callout-warning-border: #f6ad55;
        }
    }
    body {
        font-family: 'Noto Serif', serif;
        line-height: 1.7;
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
        background-color: var(--bg-color);
        color: var(--text-color);
    }
    h1, h2, h3, h4, h5, h6 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
    a { color: var(--link-color); text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; display: block; margin: 1em auto; border-radius: 4px; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid var(--border-color); padding: 8px; text-align: left; }
    th { background-color: var(--code-bg); }
    blockquote { border-left: 4px solid var(--border-color); padding-left: 1em; color: #6a737d; margin: 1em 0; }
    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; background-color: var(--code-bg); padding: .2em .4em; border-radius: 3px; }
    pre { background-color: var(--code-bg); padding: 1em; border-radius: 6px; overflow-x: auto; }
    pre code { padding: 0; background-color: transparent; }
    mark { background-color: var(--mark-bg); padding: .1em .2em; border-radius: 3px; }
    ul.task-list { list-style-type: none; padding-left: 0; }
    .callout { margin: 1.5em 0; border-left: 4px solid; border-radius: 4px; overflow: hidden; }
    .callout-title { padding: 0.5em 1em; font-weight: bold; }
    .callout-content { padding: 0.5em 1em; }
    .callout-note { background-color: var(--callout-note-bg); border-color: var(--callout-note-border); }
    .callout-warning { background-color: var(--callout-warning-bg); border-color: var(--callout-warning-border); }
    footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid var(--border-color); font-size: 0.9em; color: #6a737d;}
    """

    # The new template with placeholders for title, style, and body
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    
    <style>{css_style}</style>
    
    <script>
      MathJax = {{
        tex: {{
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        }},
        svg: {{
          fontCache: 'global'
        }}
      }};
    </script>
    <script type="text/javascript" id="MathJax-script" async
      src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js">
    </script>
</head>

<body>

    {body}

</body>
<footer>
    <a href="https://github.com/CooperElektrik/CooperElektrik.github.io">source</a>
    <p>&copy; 2025 Cooper Pham</p>
</footer>
</html>
"""

# --- Main execution (No changes here) ---

def main():
    parser = argparse.ArgumentParser(description="Convert Obsidian-flavored Markdown to a self-contained HTML file using a specific template.")
    parser.add_argument("input_file", help="Path to the input Markdown file.")
    parser.add_argument("-o", "--output", help="Path to the output HTML file. Defaults to a .html file with the same name as the input.")
    
    args = parser.parse_args()

    input_path = Path(args.input_file)
    if not input_path.is_file():
        print(f"Error: Input file not found at {input_path}")
        return

    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.with_suffix(".html")
        
    print(f"Converting '{input_path}' to '{output_path}'...")

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            md_content = f.read()

        preprocessed_md = preprocess_obsidian_markdown(md_content, input_path)
        html_body = md_converter().render(preprocessed_md)
        postprocessed_html = postprocess_html(html_body)
        
        html_title = input_path.stem
        
        final_html = get_html_template(title=html_title, body=postprocessed_html)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(final_html)
            
        print("Conversion successful!")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()