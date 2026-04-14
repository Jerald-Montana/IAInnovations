import os
import re

# Base path for the website
BASE_PATH = r"c:\Users\IAI-TS\source\repos\AI_Website\IAInnovations"

# File list with their folders
files_to_fix = {
    "BusinessTransformation": [
        "AboutUs.html",
        "AppDevelopment.html",
        "careers.html",
        "Contact.html",
        "CorporatePerformance.html",
        "EnterpriseData.html",
        "EnterpriseResource.html",
        "IntegrationApi.html",
        "ManagementConsulting.html",
        "Partnership.html",
        "ProjectManagement.html",
        "RPA.html",
        "Solutions.html"
    ],
    "DigitalExperience": [
        "DigitalExperience.html",
        "MobileExperience.html"
    ],
    "IndustrySolutions": [
        "FinancialServices.html"
    ],
    "InfrastructureServices": [
        "Infrastructure.html"
    ]
}

def convert_path(absolute_path, source_folder):
    """
    Convert absolute path to relative path based on source folder location.
    
    Rules:
    - /IAInnovations/html/index.html -> ../index.html
    - /IAInnovations/html/[same_folder]/[file].html -> ./[file].html
    - /IAInnovations/html/[other_folder]/[file].html -> ../[other_folder]/[file].html
    - /IAInnovations/images/[image].png -> ../../images/[image].png
    """
    
    # Handle image paths
    if "/IAInnovations/images/" in absolute_path:
        # Extract the image filename
        image_match = re.search(r'/IAInnovations/images/(.+?)(?:#.*)?$', absolute_path)
        if image_match:
            image_filename = image_match.group(1)
            # All HTML files are 2 levels deep, so images are ../../images/
            anchor = ""
            if "#" in absolute_path:
                anchor = "#" + absolute_path.split("#")[1]
            return f"../../images/{image_filename}{anchor}"
    
    # Handle HTML links
    if "/IAInnovations/html/" in absolute_path:
        # Extract anchor if present
        anchor = ""
        if "#" in absolute_path:
            path_part, anchor = absolute_path.split("#", 1)
            anchor = "#" + anchor
        else:
            path_part = absolute_path
        
        # Check if it's the index.html
        if path_part == "/IAInnovations/html/index.html":
            return f"../index.html{anchor}"
        
        # Extract folder and file from path
        # Expected format: /IAInnovations/html/[folder]/[file].html
        match = re.search(r'/IAInnovations/html/([^/]+)/(.+\.html)$', path_part)
        
        if match:
            target_folder = match.group(1)
            target_file = match.group(2)
            
            if target_folder == source_folder:
                # Same folder: use ./[file].html
                return f"./{target_file}{anchor}"
            else:
                # Different folder: use ../[other_folder]/[file].html
                return f"../{target_folder}/{target_file}{anchor}"
    
    # Return unchanged if no match
    return absolute_path

def fix_html_file(filepath, source_folder):
    """
    Fix all absolute paths in an HTML file.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Find and replace href="/IAInnovations/..." paths
        def replace_href(match):
            href_value = match.group(1)
            relative_path = convert_path(href_value, source_folder)
            return f'href="{relative_path}"'
        
        content = re.sub(r'href="(/IAInnovations/[^"]*)"', replace_href, content)
        
        # Find and replace src="/IAInnovations/..." paths
        def replace_src(match):
            src_value = match.group(1)
            relative_path = convert_path(src_value, source_folder)
            return f'src="{relative_path}"'
        
        content = re.sub(r'src="(/IAInnovations/[^"]*)"', replace_src, content)
        
        # Write back if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    
    except Exception as e:
        print(f"  ERROR: {str(e)}")
        return None

# Main execution
print("=" * 70)
print("FIXING BROKEN ABSOLUTE PATHS IN HTML FILES")
print("=" * 70)

successful = []
failed = []
no_changes = []

for folder, files in files_to_fix.items():
    print(f"\nProcessing {folder}/ folder:")
    for filename in files:
        filepath = os.path.join(BASE_PATH, "html", folder, filename)
        
        if not os.path.exists(filepath):
            print(f"  ✗ {filename} - FILE NOT FOUND")
            failed.append(f"{folder}/{filename}")
            continue
        
        result = fix_html_file(filepath, folder)
        
        if result is None:
            print(f"  ✗ {filename} - ERROR")
            failed.append(f"{folder}/{filename}")
        elif result:
            print(f"  ✓ {filename} - UPDATED")
            successful.append(f"{folder}/{filename}")
        else:
            print(f"  ~ {filename} - NO CHANGES NEEDED")
            no_changes.append(f"{folder}/{filename}")

# Summary
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Successfully updated: {len(successful)}")
if successful:
    for f in successful:
        print(f"  • {f}")

print(f"\nNo changes needed: {len(no_changes)}")
if no_changes:
    for f in no_changes:
        print(f"  • {f}")

if failed:
    print(f"\nFailed: {len(failed)}")
    for f in failed:
        print(f"  • {f}")
else:
    print(f"\nFailed: 0")

print("=" * 70)
