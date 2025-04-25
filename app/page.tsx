"use client"
import { useState } from "react"
import type React from "react"

import { ArrowLeftRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define conversion factors and categories
const CONVERSIONS = {
  length: {
    Meter: 1.0,
    Kilometer: 0.001,
    Centimeter: 100.0,
    Millimeter: 1000.0,
    Mile: 0.000621371,
    Yard: 1.09361,
    Foot: 3.28084,
    Inch: 39.3701,
  },
  weight: {
    Kilogram: 1.0,
    Gram: 1000.0,
    Milligram: 1000000.0,
    "Metric Ton": 0.001,
    Pound: 2.20462,
    Ounce: 35.274,
  },
  temperature: {
    Celsius: "C",
    Fahrenheit: "F",
    Kelvin: "K",
  },
  area: {
    "Square Meter": 1.0,
    "Square Kilometer": 0.000001,
    "Square Centimeter": 10000.0,
    "Square Millimeter": 1000000.0,
    "Square Mile": 3.861e-7,
    "Square Yard": 1.19599,
    "Square Foot": 10.7639,
    "Square Inch": 1550.0,
    Acre: 0.000247105,
    Hectare: 0.0001,
  },
  volume: {
    "Cubic Meter": 1.0,
    "Cubic Centimeter": 1000000.0,
    Liter: 1000.0,
    Milliliter: 1000000.0,
    "Gallon (US)": 264.172,
    "Quart (US)": 1056.69,
    "Pint (US)": 2113.38,
    "Cup (US)": 4226.75,
    "Fluid Ounce (US)": 33814.0,
    "Tablespoon (US)": 67628.0,
    "Teaspoon (US)": 202884.0,
  },
}

export default function UnitConverter() {
  const [category, setCategory] = useState("length")
  const [fromUnit, setFromUnit] = useState(Object.keys(CONVERSIONS.length)[0])
  const [toUnit, setToUnit] = useState(Object.keys(CONVERSIONS.length)[1])
  const [inputValue, setInputValue] = useState("1")
  const [result, setResult] = useState("")

  const availableUnits = Object.keys(CONVERSIONS[category as keyof typeof CONVERSIONS])

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setFromUnit(Object.keys(CONVERSIONS[value as keyof typeof CONVERSIONS])[0])
    setToUnit(Object.keys(CONVERSIONS[value as keyof typeof CONVERSIONS])[1])
    calculateResult(
      inputValue,
      Object.keys(CONVERSIONS[value as keyof typeof CONVERSIONS])[0],
      Object.keys(CONVERSIONS[value as keyof typeof CONVERSIONS])[1],
      value,
    )
  }

  const handleFromUnitChange = (value: string) => {
    setFromUnit(value)
    // Avoid same unit for from and to
    if (value === toUnit) {
      for (const unit of availableUnits) {
        if (unit !== value) {
          setToUnit(unit)
          calculateResult(inputValue, value, unit, category)
          break
        }
      }
    } else {
      calculateResult(inputValue, value, toUnit, category)
    }
  }

  const handleToUnitChange = (value: string) => {
    setToUnit(value)
    calculateResult(inputValue, fromUnit, value, category)
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    calculateResult(inputValue, toUnit, fromUnit, category)
  }

  const clearInput = () => {
    setInputValue("")
    setResult("")
  }

  const calculateResult = (value: string, from: string, to: string, cat: string) => {
    try {
      const numValue = Number.parseFloat(value)
      if (isNaN(numValue)) {
        setResult("Please enter a valid number")
        return
      }

      let resultValue
      // Handle temperature conversions specially
      if (cat === "temperature") {
        if (from === "Celsius" && to === "Fahrenheit") {
          resultValue = (numValue * 9) / 5 + 32
        } else if (from === "Celsius" && to === "Kelvin") {
          resultValue = numValue + 273.15
        } else if (from === "Fahrenheit" && to === "Celsius") {
          resultValue = ((numValue - 32) * 5) / 9
        } else if (from === "Fahrenheit" && to === "Kelvin") {
          resultValue = ((numValue - 32) * 5) / 9 + 273.15
        } else if (from === "Kelvin" && to === "Celsius") {
          resultValue = numValue - 273.15
        } else if (from === "Kelvin" && to === "Fahrenheit") {
          resultValue = ((numValue - 273.15) * 9) / 5 + 32
        } else {
          // Same unit
          resultValue = numValue
        }
      } else {
        // For other conversions, use the conversion factors
        const conversions = CONVERSIONS[cat as keyof typeof CONVERSIONS]
        const fromFactor = conversions[from as keyof typeof conversions]
        const toFactor = conversions[to as keyof typeof conversions]

        // Convert to base unit then to target unit
        if (typeof fromFactor === "number" && typeof toFactor === "number") {
          const baseValue = numValue / fromFactor
          resultValue = baseValue * toFactor
        } else {
          setResult("Conversion not supported")
          return
        }
      }

      // Format the result
      if (Math.abs(resultValue) < 0.000001 || Math.abs(resultValue) > 1000000) {
        setResult(`${resultValue.toExponential(6)} ${to}`)
      } else {
        setResult(`${resultValue.toFixed(6).replace(/\.?0+$/, "")} ${to}`)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    calculateResult(value, fromUnit, toUnit, category)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Navbar */}
      <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Unit Converter</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Unit Converter</h1>
            <p className="text-gray-500">Convert between different units of measurement</p>
          </div>

          {/* Category Tabs */}
          <Tabs defaultValue="length" value={category} onValueChange={handleCategoryChange} className="w-full mb-6">
            <TabsList className="w-full overflow-x-auto flex-wrap justify-start">
              {Object.keys(CONVERSIONS).map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Converter Card */}
          <Card className="p-6">
            <div className="space-y-6">
              {/* Unit Selection */}
              <div className="flex items-center gap-2">
                <Select value={fromUnit} onValueChange={handleFromUnitChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={swapUnits} aria-label="Swap units">
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>

                <Select value={toUnit} onValueChange={handleToUnitChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Enter value"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="text-lg"
                />
                <Button variant="outline" onClick={clearInput} aria-label="Clear input">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              {/* Result */}
              <div className="mt-4 p-4 bg-teal-50 rounded-md min-h-16 flex items-center justify-center">
                <p className="text-2xl font-bold text-teal-600">{result || "Enter a value to convert"}</p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">Built with Next.js (Visual representation of Python Reflex UI)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
