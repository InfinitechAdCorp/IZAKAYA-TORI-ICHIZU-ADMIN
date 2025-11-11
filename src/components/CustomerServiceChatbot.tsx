"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const FAQ_DATA = [
  {
    question: "What type of restaurant is Izakaya Tori Ichizu?",
    answer:
      "Izakaya Tori Ichizu is an authentic Japanese izakaya specializing in yakitori (grilled chicken skewers) and traditional Japanese pub fare. We've been serving the community since 2018.",
  },
  {
    question: "What are your operating hours?",
    answer: "We're open daily! Please contact us directly for specific hours or visit our location in Malate, Manila.",
  },
  {
    question: "Do you offer vegetarian or vegan options?",
    answer:
      "Yes! We offer vegetarian and vegan options including vegetable yakitori, edamame, and traditional Japanese vegetable dishes.",
  },
  {
    question: "What makes Izakaya Tori Ichizu special?",
    answer:
      "We specialize in premium yakitori using the finest chicken, grilled over charcoal to perfection. Our chefs are trained in Tokyo and bring authentic Japanese izakaya experience with traditional recipes and warm hospitality.",
  },
  {
    question: "Do you take reservations?",
    answer: "Yes, we accept reservations! Please contact us to book your table and ensure the best dining experience.",
  },
  {
    question: "What are your signature dishes?",
    answer:
      "Our signature dishes include premium yakitori (grilled chicken skewers), fresh sashimi, traditional ramen, and authentic Japanese appetizers prepared by our experienced chefs trained in Tokyo.",
  },
]

export default function CustomerServiceChatbot() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isChatEnded, setIsChatEnded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Hide component if on home page
  if (pathname === "/") {
    return null
  }

  useEffect(() => {
    if (isOpen && messages.length === 0 && !isChatEnded) {
      setTimeout(() => {
        addBotMessage("Hello! Welcome to Izakaya Tori Ichizu 🍗 Please select a question below to get started!")
      }, 500)
    }
  }, [isOpen, messages.length, isChatEnded])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleEndChat = () => {
    setIsTyping(true)
    setTimeout(() => {
      addBotMessage(
        "Thank you for chatting with us! This conversation has ended. If you have more questions, please start a new chat. Have a great day! 🌟",
      )
      setIsTyping(false)
      setIsChatEnded(true)
    }, 2000)
  }

  const handleNewChat = () => {
    setMessages([])
    setIsChatEnded(false)
    setTimeout(() => {
      addBotMessage("Hello! Welcome back to Izakaya Tori Ichizu 🍗 Please select a question below to get started!")
    }, 500)
  }

  const handleFAQClick = (question: string, answer: string) => {
    if (isChatEnded) return

    const questionMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, questionMessage])

    setIsTyping(true)
    setTimeout(() => {
      addBotMessage(answer)
      setIsTyping(false)
    }, 2000)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 z-50 transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[420px] h-[85vh] md:h-[700px] max-h-[700px] shadow-2xl z-50 flex flex-col border-orange-200 rounded-t-2xl md:rounded-2xl overflow-hidden p-0">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white flex flex-row items-center justify-between p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Customer Service</CardTitle>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
                  Izakaya Tori Ichizu
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-3">
                <div className="space-y-3 pb-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-tr-sm"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p
                          className={`text-[10px] mt-1.5 ${
                            message.sender === "user" ? "text-white/80" : "text-gray-400"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Quick Replies Section */}
            {!isChatEnded && (
              <div className="border-t-2 border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                <p className="text-[11px] font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">Quick replies:</p>
                <div className="max-h-[140px] overflow-y-auto">
                  <div className="flex flex-wrap gap-2 pr-1">
                    {FAQ_DATA.map((faq, index) => (
                      <button
                        key={index}
                        onClick={() => handleFAQClick(faq.question, faq.answer)}
                        disabled={isTyping}
                        className="text-[11px] px-3 py-1.5 rounded-full border-2 border-orange-300 text-orange-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-normal text-left leading-snug"
                      >
                        {faq.question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 py-3 bg-white flex-shrink-0">
              {!isChatEnded ? (
                <Button
                  onClick={handleEndChat}
                  variant="outline"
                  className="w-full text-sm border-2 border-orange-300 text-orange-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 bg-white font-medium rounded-xl h-10 transition-all duration-200"
                  disabled={isTyping}
                >
                  End Chat
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3 font-medium">Chat has ended</p>
                  <Button
                    onClick={handleNewChat}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium rounded-xl h-10 shadow-md"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
