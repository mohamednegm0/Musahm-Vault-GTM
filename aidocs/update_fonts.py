import os
import re

def update_css_fonts(directory):
    updated_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            # Skip Sidebar.css as requested
            if file.endswith('.css') and file != 'Sidebar.css':
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Regex to find font-size: ...px
                    def sub_px(match):
                        val_str = match.group(1)
                        try:
                            val = float(val_str)
                            # Only subtract if val > 2 to avoid 0 or negative
                            if val > 2:
                                # Keep decimal if it was there
                                if '.' in val_str:
                                    return f"font-size: {val - 2}px"
                                else:
                                    return f"font-size: {int(val - 2)}px"
                            return match.group(0)
                        except ValueError:
                            return match.group(0)

                    new_content = re.sub(r'font-size:\s*([\d\.]+)px', sub_px, content)

                    # Regex to find font-size: ...rem
                    def sub_rem(match):
                        val_str = match.group(1)
                        try:
                            val = float(val_str)
                            # 1rem = 16px, so -2px = -0.125rem
                            new_val = val - 0.125
                            if new_val > 0:
                                return f"font-size: {round(new_val, 4)}rem"
                            return match.group(0)
                        except ValueError:
                            return match.group(0)

                    new_content = re.sub(r'font-size:\s*([\d\.]+)rem', sub_rem, new_content)

                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8', newline='') as f:
                            f.write(new_content)
                        updated_files.append(filepath)
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")
    
    return updated_files

if __name__ == "__main__":
    target_dir = r'd:\Musahm-Vault\Frontend\apps\web\src'
    updated = update_css_fonts(target_dir)
    print(f"Updated {len(updated)} files:")
    for f in updated:
        print(f" - {f}")
