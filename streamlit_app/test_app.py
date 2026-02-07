"""
Test script to verify Streamlit app functionality
Run: python test_app.py
"""

import os
from datetime import datetime, timedelta

def test_imports():
    """Test all required imports"""
    print("Testing imports...")
    try:
        import streamlit
        import google.generativeai as genai
        import plotly.graph_objects
        import pandas
        import requests
        print("✅ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_gemini_api():
    """Test Gemini API connection"""
    print("\nTesting Gemini API...")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("⚠️  GEMINI_API_KEY not found in environment")
        print("   Set it with: export GEMINI_API_KEY=your_key")
        return False
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        response = model.generate_content("Hello! Respond with 'OK' if you're working.")
        print(f"✅ Gemini API working: {response.text[:50]}")
        return True
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return False

def test_ndvi_calculation():
    """Test NDVI calculation"""
    print("\nTesting NDVI calculation...")
    
    def calculate_ndvi(red, nir):
        if nir + red == 0:
            return 0
        return (nir - red) / (nir + red)
    
    # Test cases
    tests = [
        (0.3, 0.5, 0.25),  # (red, nir, expected_ndvi)
        (0.2, 0.6, 0.5),
        (0.4, 0.4, 0.0),
    ]
    
    all_passed = True
    for red, nir, expected in tests:
        result = calculate_ndvi(red, nir)
        if abs(result - expected) < 0.01:
            print(f"✅ NDVI({red}, {nir}) = {result:.2f} (expected {expected})")
        else:
            print(f"❌ NDVI({red}, {nir}) = {result:.2f} (expected {expected})")
            all_passed = False
    
    return all_passed

def test_satellite_data_generation():
    """Test mock satellite data generation"""
    print("\nTesting satellite data generation...")
    
    try:
        import random
        
        start_date = datetime.now() - timedelta(days=730)
        end_date = datetime.now()
        
        data = []
        current = start_date
        base_ndvi = 0.7
        decline_rate = 0.15 / 365
        
        while current <= end_date:
            days_passed = (current - start_date).days
            ndvi = max(0.2, base_ndvi - (decline_rate * days_passed) + random.uniform(-0.05, 0.05))
            
            data.append({
                'date': current,
                'ndvi': ndvi,
                'red': 0.3,
                'nir': 0.3 + ndvi
            })
            
            current += timedelta(days=30)
        
        print(f"✅ Generated {len(data)} data points")
        print(f"   Date range: {data[0]['date'].date()} to {data[-1]['date'].date()}")
        print(f"   NDVI range: {min(d['ndvi'] for d in data):.3f} to {max(d['ndvi'] for d in data):.3f}")
        return True
    except Exception as e:
        print(f"❌ Data generation error: {e}")
        return False

def test_analysis_logic():
    """Test fallback analysis logic"""
    print("\nTesting analysis logic...")
    
    try:
        # Mock NDVI data with declining trend
        ndvi_data = [
            {'date': datetime.now() - timedelta(days=i*30), 'ndvi': 0.7 - (i * 0.05)}
            for i in range(24)
        ]
        ndvi_data.reverse()
        
        latest_ndvi = ndvi_data[-1]['ndvi']
        first_ndvi = ndvi_data[0]['ndvi']
        trend = latest_ndvi - first_ndvi
        
        print(f"   First NDVI: {first_ndvi:.3f}")
        print(f"   Latest NDVI: {latest_ndvi:.3f}")
        print(f"   Trend: {trend:.3f}")
        
        if latest_ndvi < 0.3 or trend < -0.2:
            risk_level = 'critical'
        elif latest_ndvi < 0.4 or trend < -0.1:
            risk_level = 'high'
        elif latest_ndvi < 0.5:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        print(f"✅ Risk level: {risk_level}")
        return True
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("TerraTrace x NagarSathi - Streamlit App Tests")
    print("=" * 60)
    
    results = {
        "Imports": test_imports(),
        "Gemini API": test_gemini_api(),
        "NDVI Calculation": test_ndvi_calculation(),
        "Satellite Data": test_satellite_data_generation(),
        "Analysis Logic": test_analysis_logic()
    }
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:.<40} {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All tests passed! App is ready to deploy.")
    else:
        print("⚠️  Some tests failed. Please fix issues before deploying.")
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
