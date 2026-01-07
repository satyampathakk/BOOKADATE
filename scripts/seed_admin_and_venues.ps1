# Usage: pwsh scripts/seed_admin_and_venues.ps1 -Email admin@example.com -Password yourpassword
param(
    [string]$Email = "admin@example.com",
    [string]$Password = "yourpassword",
    [string]$Name = "Admin User",
    [string]$Phone = "1234567890",
    [string]$Gender = "other",
    [string]$Dob = "1990-01-01"
)

$ErrorActionPreference = 'Stop'
$BaseUrl = "http://localhost:8000"

function Write-Step($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host $msg -ForegroundColor Green }
function Write-Err($msg)  { Write-Host $msg -ForegroundColor Red }

function Get-Token {
    param([string]$Email, [string]$Password)
    try {
        $body = @{ email = $Email; password = $Password } | ConvertTo-Json
        $res = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -Body $body -ContentType "application/json" -ErrorAction Stop
        return $res.access_token
    } catch {
        Write-Err "Login failed: $($_.Exception.Message)"; return $null
    }
}

function Signup-Admin {
    param([string]$Email, [string]$Password, [string]$Name, [string]$Phone, [string]$Gender, [string]$Dob)
    $body = @{ name = $Name; email = $Email; phone = $Phone; gender = $Gender; dob = $Dob; password = $Password; bio = "Admin account" } | ConvertTo-Json
    $res = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/signup" -Body $body -ContentType "application/json" -ErrorAction Stop
    return $res.access_token
}

function Add-Venue {
    param([string]$Token, [hashtable]$Venue)
    $headers = @{ Authorization = "Bearer $Token" }
    $json = $Venue | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "$BaseUrl/venues/" -Headers $headers -Body $json -ContentType "application/json" -ErrorAction Stop
}

# 1) Get or create admin token
Write-Step "Checking gateway health..."
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec 5
    Write-Ok "Gateway reachable."
} catch {
    Write-Err "Gateway not reachable at $BaseUrl. Error: $($_.Exception.Message)"; exit 1
}

Write-Step "Attempting login for $Email ..."
$token = Get-Token -Email $Email -Password $Password
if (-not $token) {
    Write-Step "Login failed, attempting signup for $Email ..."
    try {
        $token = Signup-Admin -Email $Email -Password $Password -Name $Name -Phone $Phone -Gender $Gender -Dob $Dob
    } catch {
        Write-Err "Signup failed: $($_.Exception.Message)"; exit 1
    }
}

if (-not $token) { Write-Err "Unable to obtain token."; exit 1 }
Write-Ok "Obtained token for $Email"

# 2) Venues to seed
$venues = @(
    @{ name = "Sunset Lounge"; city = "San Francisco"; address = "123 Market St"; capacity = 40; price_per_hour = 150.0; description = "Rooftop with skyline view" },
    @{ name = "Garden Bistro"; city = "New York"; address = "55 Park Ave"; capacity = 60; price_per_hour = 220.0; description = "Cozy garden dining" },
    @{ name = "Harbor Coffee"; city = "Seattle"; address = "9 Pier Rd"; capacity = 30; price_per_hour = 75.0; description = "Waterfront espresso and pastries" },
    @{ name = "Skyline Terrace"; city = "Chicago"; address = "200 Lake Shore Dr"; capacity = 80; price_per_hour = 260.0; description = "Panoramic city views" }
)

# 3) Post venues
foreach ($v in $venues) {
    Write-Step "Adding venue: $($v.name) ..."
    try {
        $resp = Add-Venue -Token $token -Venue $v
        Write-Ok "Added $($v.name) (id: $($resp.id))"
    } catch {
        Write-Err "Failed to add $($v.name): $($_.Exception.Message)"
    }
}

Write-Ok "Done seeding venues."
