<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $greeting ?? 'Notification' }}</title>
    <style>
        body { background:#f6f8fb; margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Helvetica Neue', 'Noto Sans', 'Liberation Sans', sans-serif; color:#111827; }
        .container { max-width:620px; margin:0 auto; padding:24px; }
        .card { background:#ffffff; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.06); overflow:hidden; }
        .header { background:#ea580c; padding:28px 24px; color:#fff; text-align:center; }
        .brand { display:inline-flex; align-items:center; gap:12px; font-weight:700; font-size:18px; letter-spacing:.3px; }
        .brand img { height:28px; width:auto; border:0; }
        .content { padding:24px; font-size:15px; line-height:1.6; color:#374151; }
        h1 { font-size:20px; margin:0 0 8px; color:#111827; }
        p { margin:0 0 12px; }
        .btn { display:inline-block; background:#ea580c; color:#fff !important; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600; box-shadow:0 6px 14px rgba(35,173,148,.25); }
        .btn:hover { filter:brightness(0.98); }
        .action { text-align:center; padding:8px 0 4px; }
        .subcopy { margin-top:18px; font-size:12px; color:#6B7280; word-break:break-word; }
        .footer { text-align:center; margin-top:16px; font-size:12px; color:#9CA3AF; }
        .divider { height:1px; background:#F3F4F6; margin:16px 0; border:0; }
        a { color:#ea580c; }
    </style>
  </head>
  <body>
    @php
      $appName = \App\Services\AppSettingsService::getAppName();
      try {
          $custom = \App\Models\FrontCustomization::query()->first();
          $logoUrl = $custom?->logo_image ?: url('/images/logo.png');
      } catch (\Throwable $e) {
          $logoUrl = url('/images/logo.png');
      }
    @endphp
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="brand">
            <img src="{{ $logoUrl }}" alt="Logo">
            <span>{{ $appName }}</span>
          </div>
        </div>
        <div class="content" style="padding: 30px;">
          <h1>{{ $greeting ?? 'Bonjour,' }}</h1>
          @foreach(($introLines ?? []) as $line)
            <p>{{ $line }}</p>
          @endforeach

          @isset($actionText)
            <div class="action">
              <a href="{{ $actionUrl }}" class="btn" target="_blank" rel="noopener">
                {{ $actionText }}
              </a>
            </div>
            <div class="subcopy">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:
              <br>
              <a href="{{ $actionUrl }}">{{ $actionUrl }}</a>
            </div>
          @endisset

          @if(!empty($outroLines))
            <hr class="divider"/>
          @endif
          @foreach(($outroLines ?? []) as $line)
            <p>{{ $line }}</p>
          @endforeach

          <p style="margin-top:16px;">{{ $salutation ?? 'Cordialement,' }}<br>{{ $appName }}</p>
        </div>
      </div>
      <p class="footer">&copy; {{ date('Y') }} {{ $appName }}. Tous droits réservés.</p>
    </div>
  </body>
  </html>



