<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger( 'user_id' );
            $table->double( 'basic_salary' );
            $table->double( 'accommodation_cost' );
            $table->date( 'joining_date' );
            $table->string( 'phone' );
            $table->string( 'emergency_contact' )->nullable(true);
            $table->string( 'position' )->nullable(true);
            $table->string( 'attachment' )->nullable(true);
            $table->json('extras')->nullable(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
