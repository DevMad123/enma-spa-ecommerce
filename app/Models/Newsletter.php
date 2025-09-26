<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Newsletter extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'subscribed_at',
    ];

    protected $casts = [
        'subscribed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Scopes
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('subscribed_at', '>=', Carbon::now()->subDays($days));
    }

    public function scopeToday($query)
    {
        return $query->whereDate('subscribed_at', Carbon::today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('subscribed_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('subscribed_at', [
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth()
        ]);
    }

    // Helpers
    public function getFormattedSubscribedAtAttribute()
    {
        return $this->subscribed_at->format('d/m/Y à H:i');
    }

    public static function getTotalSubscribers()
    {
        return self::count();
    }

    public static function getRecentSubscribers($days = 7)
    {
        return self::recent($days)->count();
    }

    public static function getGrowthRate()
    {
        $thisMonth = self::thisMonth()->count();
        $lastMonth = self::whereBetween('subscribed_at', [
            Carbon::now()->subMonth()->startOfMonth(),
            Carbon::now()->subMonth()->endOfMonth()
        ])->count();

        if ($lastMonth === 0) {
            return $thisMonth > 0 ? 100 : 0;
        }

        return round((($thisMonth - $lastMonth) / $lastMonth) * 100, 2);
    }
}
