<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response([
                'msg' => "Provided Email Address or Password is Incorrect",
                'status' => 422,
            ]);
        }
        $user = Auth::user();
        $token = $user->createToken('main')->plainTextToken;
        return response([
            'status' => 200,
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function signup(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        $token = $user->createToken('main')->plainTextToken;
        Auth::login($user);
        return response([
            'status' => 200,
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'currentPass' => 'required|string',
            'newPass' => 'required|string|min:6',
        ]);
        $user = Auth::user();
        if (!Hash::check($request->currentPass, $user->password)) {
            return response()->json(['status' => 400, 'msg' => "The current password is incorrect"]);
        }
        $user->update(['password' => Hash::make($request->newPass)]);
        return response()->json(['status' => 200, 'msg' => "Password Successfully Changed"]);
    }
}