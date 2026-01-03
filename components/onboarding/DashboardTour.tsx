'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Map, Lightbulb, MessageCircle } from 'lucide-react';

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'Bienvenido a TeacherOS',
        content: 'Este es tu Hub de Inteligencia Educativa. Vamos a dar un paseo rápido para que domines tus nuevas herramientas.',
        icon: <Map className="w-10 h-10 text-blue-500" />
    },
    {
        id: 'graph',
        title: 'El Cerebro de tu Clase',
        content: 'El Grafo de Competencias visualiza qué saben tus alumnos. Los nodos rojos indican bloqueos que requieren tu atención.',
        icon: <Map className="w-10 h-10 text-indigo-500" />
    },
    {
        id: 'insights',
        title: 'IA Proactiva',
        content: 'No busques agujas en un pajar. TeacherOS analiza los datos y te propone "Insights" accionables aquí.',
        icon: <Lightbulb className="w-10 h-10 text-amber-500" />
    },
    {
        id: 'action',
        title: 'Toma el Control',
        content: 'Usa el Chat Socrático para crear nuevos caminos de aprendizaje o diagnósticos en segundos.',
        icon: <MessageCircle className="w-10 h-10 text-emerald-500" />
    }
];

export function DashboardTour() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('teacher-os-tour-completed');
        if (!hasSeen) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('teacher-os-tour-completed', 'true');
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <div className="relative p-8 text-center">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-gray-50 rounded-full">
                                    {step.icon}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                {step.title}
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {step.content}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    {TOUR_STEPS.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    {currentStep === TOUR_STEPS.length - 1 ? '¡Empezar!' : 'Siguiente'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
