<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function index()
    {
        return inertia('front/About');
    }
    public function indexPro()
    {
        return inertia('front/About-pro');
    }
}
