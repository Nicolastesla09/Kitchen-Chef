/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TRANSLATIONS ---
const translations = {
    en: {
        // General
        pantryChefAI: "Kitchen Chef",
        errorOccurred: "An error occurred. Please try again.",
        // Tabs
        recipe: "Recipe",
        profile: "Profile",
        // Add Photo Modal
        addAPhoto: "Add a Photo",
        takeAPhoto: "Take a Photo",
        uploadAPhoto: "Upload a Photo",
        // Recipe Screen - Config
        next: "Next",
        meal: "Meal",
        drink: "Drink",
        cuisine: "Cuisine:",
        servings: "Servings:",
        timeAvailable: "Cooking Time:",
        under15min: "Under 15 min",
        under30min: "Under 30 min",
        under45min: "Under 45 min",
        under60min: "Under 60 min",
        people: "People",
        any: "Any",
        cook: "Plan recipes",
        cooking: "Cooking...",
        // Recipe Screen - Results
        recipeSuggestions: "Recipe Suggestions",
        instructions: "Instructions",
        view: "View",
        generatingImage: "Plating your dish...",
        cookingTime: "Cooking Time",
        calories: "Calories",
        // Image View Modal
        save: "Save",
        share: "Share",
        // Profile Screen
        language: "Language",
        english: "English",
        chinese: "Chinese",
        vietnamese: "Vietnamese",
        // Errors
        uploadError: "Please upload a pantry photo first.",
        recipeError: "Failed to generate recipes. The photo might be unclear or the pantry is missing key ingredients.",
        renderError: "Failed to render the image. Please try again."

    },
    zh: {
        // General
        pantryChefAI: "厨房大厨",
        errorOccurred: "发生错误。请再试一次。",
        // Tabs
        recipe: "食谱",
        profile: "个人资料",
        // Add Photo Modal
        addAPhoto: "添加照片",
        takeAPhoto: "拍照",
        uploadAPhoto: "上传照片",
        // Recipe Screen - Config
        next: "下一步",
        meal: "餐",
        drink: "饮料",
        cuisine: "菜系:",
        servings: "份量:",
        timeAvailable: "烹饪时间:",
        under15min: "15分钟以下",
        under30min: "30分钟以下",
        under45min: "45分钟以下",
        under60min: "60分钟以下",
        people: "人",
        any: "任何",
        cook: "规划食谱",
        cooking: "烹饪中...",
        // Recipe Screen - Results
        recipeSuggestions: "食谱建议",
        instructions: "说明",
        view: "查看",
        generatingImage: "正在摆盘...",
        cookingTime: "烹饪时间",
        calories: "卡路里",
        // Image View Modal
        save: "保存",
        share: "分享",
        // Profile Screen
        language: "语言",
        english: "英语",
        chinese: "中文",
        vietnamese: "越南语",
        // Errors
        uploadError: "请先上传一张储藏室的照片。",
        recipeError: "无法生成食谱。照片可能不清晰或储藏室缺少关键原料。",
        renderError: "无法渲染图像。请再试一次。"
    },
    vi: {
        // General
        pantryChefAI: "Bếp Trưởng AI",
        errorOccurred: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        // Tabs
        recipe: "Công thức",
        profile: "Hồ sơ",
        // Add Photo Modal
        addAPhoto: "Thêm ảnh",
        takeAPhoto: "Chụp ảnh",
        uploadAPhoto: "Tải ảnh lên",
        // Recipe Screen - Config
        next: "Tiếp theo",
        meal: "Món chính",
        drink: "Đồ uống",
        cuisine: "Ẩm thực:",
        servings: "Khẩu phần:",
        timeAvailable: "Thời gian nấu:",
        under15min: "Dưới 15 phút",
        under30min: "Dưới 30 phút",
        under45min: "Dưới 45 phút",
        under60min: "Dưới 60 phút",
        people: "Người",
        any: "Bất kỳ",
        cook: "Lên thực đơn",
        cooking: "Đang nấu...",
        // Recipe Screen - Results
        recipeSuggestions: "Gợi ý công thức",
        instructions: "Hướng dẫn",
        view: "Xem ảnh",
        generatingImage: "Đang trang trí món ăn...",
        cookingTime: "Thời gian nấu",
        calories: "Lượng calo",
        // Image View Modal
        save: "Lưu",
        share: "Chia sẻ",
        // Profile Screen
        language: "Ngôn ngữ",
        english: "Tiếng Anh",
        chinese: "Tiếng Trung",
        vietnamese: "Tiếng Việt",
        // Errors
        uploadError: "Vui lòng tải ảnh kho nguyên liệu của bạn lên trước.",
        recipeError: "Không thể tạo công thức. Ảnh có thể không rõ hoặc thiếu nguyên liệu chính.",
        renderError: "Không thể kết xuất hình ảnh. Vui lòng thử lại."
    }
};


// --- COMPONENTS ---

const LogoIcon = () => (
    <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.78 9.25C19.34 7.04 18.2 5.04 16.51 3.49C14.03 1.2 10.45 1.04 7.7 2.87C4.95 4.7 3.53 7.97 4.21 11.22C4.28 11.57 4.58 11.83 4.94 11.83H19.06C19.42 11.83 19.72 11.57 19.79 11.22C20.06 9.94 20.06 9.94 19.78 9.25Z" />
        <path d="M4.94 11.83H19.06C19.06 13.93 19.06 15.21 19.06 15.91C19.06 17.01 18.17 17.9 17.07 17.9H6.93C5.83 17.9 4.94 17.01 4.94 15.91V11.83Z" />
        <path d="M4.94 17.9V19.4C4.94 20.28 5.66 21 6.54 21H17.46C18.34 21 19.06 20.28 19.06 19.4V17.9" />
    </svg>
);

// Helper to convert File to GenerativePart
async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

const ImageViewModal = ({ imageUrl, recipeTitle, onClose, t }) => {
    const handleSave = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${recipeTitle.replace(/\s+/g, '_')}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `${recipeTitle.replace(/\s+/g, '_')}.jpeg`, { type: 'image/jpeg' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: recipeTitle,
                    text: `Check out this ${recipeTitle} I made with Kitchen Chef!`,
                    files: [file],
                });
            } else {
                alert('Sharing is not supported on this browser.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Could not share the image.');
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content image-view-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <img src={imageUrl} alt={recipeTitle} />
                <div className="modal-actions">
                    <button className="btn" onClick={handleSave}>{t.save}</button>
                    {navigator.share && <button className="btn btn-secondary" onClick={handleShare}>{t.share}</button>}
                </div>
            </div>
        </div>
    );
};


const InstructionsModal = ({ recipe, onClose, t }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={onClose}>×</button>
            <h3>{recipe.title}</h3>
            <div className="recipe-details-modal">
                <div>
                    <strong>{t.cookingTime}:</strong> {recipe.cooking_time}
                </div>
                <div>
                    <strong>{t.calories}:</strong> {recipe.calories}
                </div>
            </div>
            {recipe.ingredients_needed.length > 0 && (
                <>
                    <strong>Items Needed:</strong>
                    <ul>{recipe.ingredients_needed.map(item => <li key={item}>{item}</li>)}</ul>
                </>
            )}
            <strong>{t.instructions}:</strong>
            <ol className="recipe-instructions">
                {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
        </div>
    </div>
);


const AddPhotoModal = ({ onClose, onFileSelect, t }) => {
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
        e.target.value = ''; // Allow re-uploading
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-photo-modal" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => cameraInputRef.current?.click()}>{t.takeAPhoto}</button>
                <button onClick={() => uploadInputRef.current?.click()}>{t.uploadAPhoto}</button>
                <input type="file" ref={uploadInputRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
        </div>
    );
};


const RecipeScreen = ({ t, uploadedImage, backgroundImageUrl }) => {
    type AppState = 'initial' | 'photo_uploaded' | 'loading_recipes' | 'recipes_loaded';
    const [appState, setAppState] = useState<AppState>('initial');

    const [recipeData, setRecipeData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [recipeType, setRecipeType] = useState<'meal' | 'drink'>('meal');
    const [cuisine, setCuisine] = useState<string>('Any');
    const [servings, setServings] = useState<number>(2);
    const [maxCookingTime, setMaxCookingTime] = useState<string>('Any');

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
    const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        if (uploadedImage && backgroundImageUrl) {
            setRecipeData(null);
            setError(null);
            setAppState('photo_uploaded');
        } else {
            setAppState('initial'); // Reset to initial state if image is cleared
        }
    }, [uploadedImage, backgroundImageUrl]);

    const handleCook = async () => {
        if (!uploadedImage) {
            setError(t.uploadError);
            return;
        }
        setAppState('loading_recipes');
        setError(null);
        setRecipeData(null);

        try {
            const imagePart = await fileToGenerativePart(uploadedImage);
            const timeConstraint = maxCookingTime !== 'Any' ? `The total cooking time must be less than ${maxCookingTime} minutes.` : '';
            const recipePrompt = `You are a creative chef. Based on the pantry ITEMS in the image, generate exactly 3 unique ${recipeType} recipes for ${servings} people. ${timeConstraint} Strictly adhere to the "${cuisine}" cuisine. If "${cuisine}" is "Any", suggest recipes from any suitable cuisine. For each recipe, provide a title, a short description, a list of any extra ingredients needed with quantities, detailed step-by-step instructions with precise measurements (e.g., 100g, 2 tbsp), the estimated total cooking_time (e.g., "30 min"), the total calories for the dish (e.g., "450 kcal"), and a brief for generating a photorealistic image. Return ONLY JSON.`;
            const recipeResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: recipePrompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            recipes: {
                                type: Type.ARRAY, minItems: 3, maxItems: 3,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        cooking_time: { type: Type.STRING },
                                        calories: { type: Type.STRING },
                                        ingredients_needed: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        render_brief: { type: Type.STRING }
                                    },
                                    required: ["title", "description", "cooking_time", "calories", "ingredients_needed", "instructions", "render_brief"]
                                }
                            }
                        },
                        required: ["recipes"]
                    }
                }
            });
            const parsedRecipeData = JSON.parse(recipeResponse.text);
            setRecipeData(parsedRecipeData);
            setAppState('recipes_loaded');

        } catch (err) {
            console.error(err);
            setError(t.recipeError);
            setAppState('photo_uploaded'); // Go back to config on error
        }
    };

    const handleView = async (recipe: any) => {
        setSelectedRecipe(recipe);
        setIsRendering(true);
        setRenderedImageUrl(null);
        setIsImageModalOpen(true);
        setError(null);
        try {
            const prompt = `Photorealistic image of a single plated dish, centered on a clean, minimalist table. Dish description: ${recipe.render_brief}. High-quality food photography style.`;
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setRenderedImageUrl(imageUrl);
            } else {
                setError(t.renderError);
                setIsImageModalOpen(false);
            }
        } catch (err) {
            console.error(err);
            setError(t.renderError);
            setIsImageModalOpen(false);
        } finally {
            setIsRendering(false);
        }
    };
    
    const handleShowInstructions = (recipe: any) => {
        setSelectedRecipe(recipe);
        setIsInstructionsModalOpen(true);
    }

    const renderContent = () => {
        switch (appState) {
            case 'initial':
                return null; // Don't show any text on the initial screen.
            case 'photo_uploaded':
            case 'loading_recipes':
                return (
                     <div className="state-content photo-and-config-container">
                        <img src={backgroundImageUrl} alt="Pantry Upload" className="uploaded-photo-preview" />
                         <div className="configuring-state">
                            <div className="recipe-options">
                                 <div className="recipe-type-selector">
                                    <label className={recipeType === 'meal' ? 'active' : ''}>
                                        <input type="radio" name="recipeType" value="meal" checked={recipeType === 'meal'} onChange={() => setRecipeType('meal')} disabled={appState === 'loading_recipes'}/>
                                        {t.meal}
                                    </label>
                                     <label className={recipeType === 'drink' ? 'active' : ''}>
                                        <input type="radio" name="recipeType" value="drink" checked={recipeType === 'drink'} onChange={() => setRecipeType('drink')} disabled={appState === 'loading_recipes'}/>
                                        {t.drink}
                                    </label>
                                </div>
                                <div className="option-row">
                                    <div className="cuisine-selector">
                                        <label htmlFor="cuisine-select">{t.cuisine}</label>
                                        <select id="cuisine-select" value={cuisine} onChange={(e) => setCuisine(e.target.value)} disabled={appState === 'loading_recipes'}>
                                            <option value="Any">{t.any}</option>
                                            <option value="US">US</option>
                                            <option value="UK">UK</option>
                                            <option value="Italian">Italian</option>
                                            <option value="Chinese">Chinese</option>
                                            <option value="Indian">Indian</option>
                                            <option value="Vietnamese">Vietnamese</option>
                                        </select>
                                    </div>
                                    <div className="servings-selector">
                                        <label>{t.servings}</label>
                                        <div className="stepper">
                                            <button onClick={() => setServings(s => Math.max(1, s - 1))} disabled={appState === 'loading_recipes'}>-</button>
                                            <span>{servings}</span>
                                            <button onClick={() => setServings(s => s + 1)} disabled={appState === 'loading_recipes'}>+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="option-row">
                                     <div className="time-selector">
                                        <label htmlFor="time-select">{t.timeAvailable}</label>
                                        <select id="time-select" value={maxCookingTime} onChange={(e) => setMaxCookingTime(e.target.value)} disabled={appState === 'loading_recipes'}>
                                            <option value="Any">{t.any}</option>
                                            <option value="15">{t.under15min}</option>
                                            <option value="30">{t.under30min}</option>
                                            <option value="45">{t.under45min}</option>
                                            <option value="60">{t.under60min}</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="btn" onClick={handleCook} disabled={appState === 'loading_recipes'}>
                                   {appState === 'loading_recipes' ? t.cooking : t.cook}
                                </button>
                                 {appState === 'loading_recipes' && <div className="loader"></div>}
                            </div>
                        </div>
                    </div>
                );
            case 'recipes_loaded':
                return (
                    <div className="state-content results-state">
                        <div className="results-header">
                            <button className="back-button" onClick={() => setAppState('photo_uploaded')} aria-label="Go back">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <h3>{t.recipeSuggestions}</h3>
                        </div>
                        <div className="recipe-list">
                            {recipeData?.recipes.map((recipe, index) => (
                                <div key={index} className="recipe-card">
                                    <h4>{recipe.title}</h4>
                                    <p>{recipe.description}</p>
                                    <div className="recipe-details">
                                        <div className="detail-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            <span>{recipe.cooking_time}</span>
                                        </div>
                                        <div className="detail-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                            <span>{recipe.calories}</span>
                                        </div>
                                    </div>
                                    <div className="recipe-actions">
                                        <button className="btn btn-tertiary" onClick={() => handleShowInstructions(recipe)}>{t.instructions}</button>
                                        <button className="btn btn-secondary" onClick={() => handleView(recipe)}>{t.view}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

        }
    }
    
    const getBackgroundStyle = () => {
        if (appState === 'initial') {
            return { backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg')` };
        }
        return {};
    };

    return (
        <div className={`recipe-screen state-${appState}`} style={getBackgroundStyle()}>
            <div className="screen-overlay">
                {error && <div className="error-message">{error}</div>}
                {renderContent()}

                {isImageModalOpen && (
                    isRendering ? (
                         <div className="modal-overlay">
                            <div className="modal-content loading-modal">
                                <div className="loader"></div>
                                <p>{t.generatingImage}</p>
                            </div>
                        </div>
                    ) : renderedImageUrl ? (
                        <ImageViewModal imageUrl={renderedImageUrl} recipeTitle={selectedRecipe?.title} onClose={() => setIsImageModalOpen(false)} t={t} />
                    ) : null
                )}

                {isInstructionsModalOpen && selectedRecipe && (
                    <InstructionsModal recipe={selectedRecipe} onClose={() => setIsInstructionsModalOpen(false)} t={t} />
                )}
            </div>
        </div>
    );
};

const ProfileScreen = ({ language, setLanguage, t }) => {
    return (
        <div className="profile-screen">
            <h2>{t.profile}</h2>
            <div className="language-selector">
                <label>{t.language}:</label>
                <div className="language-options">
                    <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>{t.english}</button>
                    <button className={`lang-btn ${language === 'zh' ? 'active' : ''}`} onClick={() => setLanguage('zh')}>{t.chinese}</button>
                    <button className={`lang-btn ${language === 'vi' ? 'active' : ''}`} onClick={() => setLanguage('vi')}>{t.vietnamese}</button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState('recipe');
    const [language, setLanguage] = useState<'en' | 'zh' | 'vi'>('en');
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    const t = translations[language];

    const handleFileSelected = (file: File) => {
        if (file) {
            setUploadedImage(file);
            setBackgroundImageUrl(URL.createObjectURL(file));
        }
        setIsPhotoModalOpen(false);
        setActiveTab('recipe'); // switch to recipe tab after photo selection
    };

    const handleReset = () => {
        setUploadedImage(null);
        setBackgroundImageUrl(null);
        setActiveTab('recipe');
    };

    return (
        <div className="mobile-app">
            <header onClick={handleReset} title="Back to start">
                <LogoIcon />
                <h1>{t.pantryChefAI}</h1>
            </header>
            <main className="app-content">
                {activeTab === 'recipe' && <RecipeScreen t={t} uploadedImage={uploadedImage} backgroundImageUrl={backgroundImageUrl} />}
                {activeTab === 'profile' && <ProfileScreen language={language} setLanguage={setLanguage} t={t} />}
            </main>
            <nav className="tab-bar">
                <button className={`tab-item ${activeTab === 'recipe' ? 'active' : ''}`} onClick={() => setActiveTab('recipe')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21.21V21.21c0-1.05-.5-2.02-1.31-2.65L13 15v-3.3l5.3-5.3a1 1 0 0 0 0-1.41l-2.83-2.83a1 1 0 0 0-1.41 0L8.7 7.7V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v3.7L.17 10.53a1 1 0 0 0 0 1.41l2.83 2.83a1 1 0 0 0 1.41 0L7.7 11.5V15l-5.69 3.56C1.21 19.19.7 20.16.7 21.21V21.21"/><path d="M6.25 8.5C5.56 7.81 5.56 6.19 6.25 5.5s1.81-.69 2.5 0c.69.69.69 2.31 0 3s-1.81.69-2.5 0Z"/></svg>
                    <span>{t.recipe}</span>
                </button>
                <button className="tab-item add-button" onClick={() => setIsPhotoModalOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>{t.profile}</span>
                </button>
            </nav>
             {isPhotoModalOpen && <AddPhotoModal onClose={() => setIsPhotoModalOpen(false)} onFileSelect={handleFileSelected} t={t} />}
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);