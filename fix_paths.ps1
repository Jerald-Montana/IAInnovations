# Script to fix broken absolute paths in HTML files
$BASE_PATH = "c:\Users\IAI-TS\source\repos\AI_Website\IAInnovations"

$filesToFix = @{
    "BusinessTransformation" = @(
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
    )
    "DigitalExperience" = @(
        "DigitalExperience.html",
        "MobileExperience.html"
    )
    "IndustrySolutions" = @(
        "FinancialServices.html"
    )
    "InfrastructureServices" = @(
        "Infrastructure.html"
    )
}

function Convert-Path {
    param(
        [string]$absolutePath,
        [string]$sourceFolder
    )
    
    # Handle image paths
    if ($absolutePath -match '/IAInnovations/images/') {
        if ($absolutePath -match '/IAInnovations/images/(.+?)(?:#.*)?$') {
            $imageName = $matches[1]
            $anchor = ""
            if ($absolutePath -match '#') {
                $parts = $absolutePath -split '#'
                $anchor = "#" + $parts[1]
            }
            return "../../images/$imageName$anchor"
        }
    }
    
    # Handle HTML links
    if ($absolutePath -match '/IAInnovations/html/') {
        $anchor = ""
        $pathPart = $absolutePath
        
        if ($absolutePath -match '#') {
            $parts = $absolutePath -split '#'
            $pathPart = $parts[0]
            $anchor = "#" + $parts[1]
        }
        
        # Check if it's index.html
        if ($pathPart -eq '/IAInnovations/html/index.html') {
            return "../index.html$anchor"
        }
        
        # Extract folder and file
        if ($pathPart -match '/IAInnovations/html/([^/]+)/(.+\.html)$') {
            $targetFolder = $matches[1]
            $targetFile = $matches[2]
            
            if ($targetFolder -eq $sourceFolder) {
                return "./$targetFile$anchor"
            } else {
                return "../$targetFolder/$targetFile$anchor"
            }
        }
    }
    
    return $absolutePath
}

function Fix-HtmlFile {
    param(
        [string]$filepath,
        [string]$sourceFolder
    )
    
    try {
        $content = Get-Content -Path $filepath -Raw -Encoding UTF8
        $originalContent = $content
        
        # Replace all href="/IAInnovations/..." paths
        $hrefMatches = [regex]::Matches($content, 'href="(/IAInnovations/[^"]*)"')
        foreach ($hrefMatch in $hrefMatches) {
            $hrefValue = $hrefMatch.Groups[1].Value
            $relativePath = Convert-Path -absolutePath $hrefValue -sourceFolder $sourceFolder
            $content = $content.Replace("href=`"$hrefValue`"", "href=`"$relativePath`"")
        }
        
        # Replace all src="/IAInnovations/..." paths
        $srcMatches = [regex]::Matches($content, 'src="(/IAInnovations/[^"]*)"')
        foreach ($srcMatch in $srcMatches) {
            $srcValue = $srcMatch.Groups[1].Value
            $relativePath = Convert-Path -absolutePath $srcValue -sourceFolder $sourceFolder
            $content = $content.Replace("src=`"$srcValue`"", "src=`"$relativePath`"")
        }
        
        # Write back if changed
        if ($content -ne $originalContent) {
            Set-Content -Path $filepath -Value $content -Encoding UTF8
            return $true
        }
        return $false
    }
    catch {
        Write-Host "  ERROR: $_"
        return $null
    }
}

Write-Host "======================================================================="
Write-Host "FIXING BROKEN ABSOLUTE PATHS IN HTML FILES"
Write-Host "======================================================================="

$successful = @()
$failed = @()
$noChanges = @()

foreach ($folder in $filesToFix.Keys) {
    Write-Host ""
    Write-Host "Processing $folder/ folder:"
    
    foreach ($filename in $filesToFix[$folder]) {
        $filepath = Join-Path -Path $BASE_PATH -ChildPath "html\$folder\$filename"
        
        if (-not (Test-Path -Path $filepath)) {
            Write-Host "  X $filename - FILE NOT FOUND"
            $failed += "$folder/$filename"
            continue
        }
        
        $result = Fix-HtmlFile -filepath $filepath -sourceFolder $folder
        
        if ($null -eq $result) {
            Write-Host "  X $filename - ERROR"
            $failed += "$folder/$filename"
        } elseif ($result) {
            Write-Host "  + $filename - UPDATED"
            $successful += "$folder/$filename"
        } else {
            Write-Host "  - $filename - NO CHANGES NEEDED"
            $noChanges += "$folder/$filename"
        }
    }
}

Write-Host ""
Write-Host "======================================================================="
Write-Host "SUMMARY"
Write-Host "======================================================================="

Write-Host "Successfully updated: $($successful.Count)"
if ($successful.Count -gt 0) {
    foreach ($f in $successful) {
        Write-Host "  + $f"
    }
}

Write-Host ""
Write-Host "No changes needed: $($noChanges.Count)"
if ($noChanges.Count -gt 0) {
    foreach ($f in $noChanges) {
        Write-Host "  - $f"
    }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed: $($failed.Count)"
    foreach ($f in $failed) {
        Write-Host "  X $f"
    }
} else {
    Write-Host ""
    Write-Host "Failed: 0"
}

Write-Host "======================================================================="
