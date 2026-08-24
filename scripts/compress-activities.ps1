# 社团活动照片压缩脚本
# 用法：把 4 张活动照片放入 public/assets/inbox/（按顺序命名为 1.jpg 2.jpg 3.jpg 4.jpg，与活动报道顺序一致）
#      运行 powershell -File scripts/compress-activities.ps1
#      输出到 public/assets/activity-1.jpg ~ activity-4.jpg（限宽 1600px · JPEG 质量 72）
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$inDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'public\assets\inbox'
$files = @(Get-ChildItem $inDir -File | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } | Sort-Object Name)

if ($files.Count -lt 4) {
  throw "需要 4 张照片，当前仅找到 $($files.Count) 张。请放入 $inDir 目录。"
}

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]72)

for ($index = 0; $index -lt 4; $index += 1) {
  $source = $files[$index]
  $img = [System.Drawing.Image]::FromFile($source.FullName)
  try {
    $maxWidth = 1600
    if ($img.Width -le $maxWidth) {
      $width = $img.Width
      $height = $img.Height
    } else {
      $width = $maxWidth
      $height = [int]([Math]::Round($img.Height * ($maxWidth / $img.Width)))
    }
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.DrawImage($img, 0, 0, $width, $height)
    } finally {
      $graphics.Dispose()
    }
    $output = Join-Path (Split-Path $inDir -Parent) ("activity-{0}.jpg" -f ($index + 1))
    $bmp.Save($output, $encoder, $params)
    $bmp.Dispose()
    $sizeKb = [int]((Get-Item $output).Length / 1KB)
    "{0} ({1}x{2}) -> activity-{3}.jpg ({4} KB)" -f $source.Name, $width, $height, ($index + 1), $sizeKb
  } finally {
    $img.Dispose()
  }
}
