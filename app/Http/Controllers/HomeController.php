<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        return inertia('front/Home');
    }
    public function index2()
    {
        return inertia('front/Home-2');
    }
    public function index3()
    {
        return inertia('front/Home-3');
    }
}
