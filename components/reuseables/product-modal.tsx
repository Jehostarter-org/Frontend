'use client'

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  title: string
  price: number
  currency?: string
  image: string
  sellerName: string
  condition: string
  description: string
}

interface ProductModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

const quickMessages = [
  "I'm interested in this item.",
  "Is this item still available?",
  "What condition is this item in?",
  "Do you deliver?"
]

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [customMessage, setCustomMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Format price helper
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currency || "USD",
    }).format(product.price);
  }, [product.price, product.currency]);

  if (!isOpen) return null

  const handleSendMessage = () => {
    const messageToSend = selectedTemplate || customMessage
    console.log(`[v0] Sending message to ${product.sellerName}: ${messageToSend}`)
    setCustomMessage('')
    setSelectedTemplate(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Message {product.sellerName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Preview */}
          <div className="flex gap-4 pb-6 border-b border-gray-200">
            <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Product
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{product.title}</h3>
              <p className="text-lg font-bold text-gray-900 mt-1">{formattedPrice}</p>
            </div>
          </div>

          {/* Quick Message Templates */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Quick messages:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickMessages.map((template) => (
                <button
                  key={template}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setCustomMessage('')
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTemplate === template
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Or write your own message:
            </label>
            <textarea
              id="message"
              value={customMessage}
              onChange={(e) => {
                setCustomMessage(e.target.value)
                setSelectedTemplate(null)
              }}
              placeholder="Please type your message to the seller"
              className="w-full px-4 py-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={5}
            />
            <p className="text-xs text-gray-500">
              Don't share your email, phone number or financial information.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!selectedTemplate && !customMessage.trim()}
              className="px-6 bg-teal-600 hover:bg-teal-700 text-white"
            >
              Send message
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
