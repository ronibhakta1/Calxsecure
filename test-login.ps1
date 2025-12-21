# Wait for server
Start-Sleep 5

# Test signup
$signupBody = @{
    name = "Test SignUp User"
    phoneNumber = "9123456789"
    password = "TestPassword123"
    email = "testsignup@example.com"
    userPin = "5678"
} | ConvertTo-Json

Write-Host "Testing SIGNUP..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/signup" -Method POST -Headers @{"Content-Type"="application/json"} -Body $signupBody
    Write-Host "Signup Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Signup Error: $($_.Exception.Message)"
    $statusCode = $_.Exception.Response.StatusCode.Value
    $content = $_.Exception.Response.Content.ReadAsStream() | ConvertFrom-Json
    Write-Host "Status Code: $statusCode"
    Write-Host "Error Response: $($content | ConvertTo-Json)"
}

# Test signin with known user
Write-Host "`nTesting SIGNIN with known user..."
$signinBody = @{
    phone = "1111111111"
    password = "Nasir"
} | ConvertTo-Json

# This would call NextAuth signIn which requires browser session
# For API testing, we'd need to test the credentials provider directly
Write-Host "For signin testing, navigate to http://localhost:3001/auth/signin and test manually"
