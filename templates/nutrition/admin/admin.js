// NutriFlow Admin Application Logic

// ==================== STATE MANAGEMENT ====================
const state = {
    activeView: 'admin-clients',
    appointments: [],
    clients: [
        { name: 'Sarah Jenkins', email: 'sarah.j@email.com', goal: 'Weight Loss', lastCheckIn: 'Today, 9:00 AM', compliance: 92, weightTrend: [168, 169, 170, 173, 174, 176], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', therapist: 'Dr. Hasan', activeProgramId: 'prog-sarah', allergies: ['Peanuts', 'Seafood/Shellfish'], conditions: ['Diabetes Type 2'] },
        { name: 'Marcus Reid', email: 'm.reid@email.com', goal: 'Muscle Gain', lastCheckIn: '2 days ago', compliance: 78, weightTrend: [180, 182, 181, 183, 182, 185], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', therapist: 'Dr. Hasan', activeProgramId: 'prog-marcus', allergies: ['Lactose/Dairy'], conditions: ['GERD/Maag'] },
        { name: 'Elena Lopez', email: 'elena.l@email.com', goal: 'Maintenance', lastCheckIn: 'Yesterday', compliance: 95, weightTrend: [142, 142, 141, 142, 142, 142], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', therapist: 'Dr. Amanda', activeProgramId: 'prog-elena', allergies: [], conditions: ['High Cholesterol'] }
    ],
    foodLibrary: [
        { id: 'f-1', title: 'Avocado Egg Toast', type: 'Recipes', calories: 320, p: 14, c: 22, f: 18, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200', favorite: true, recipeIngredients: "2 slices whole wheat bread\n1 ripe avocado\n2 large eggs\n1 tsp lemon juice\nPinch of salt and black pepper", recipeSteps: "1. Toast 2 slices of whole wheat bread.\n2. Mash 1 avocado with lemon juice, salt, and pepper.\n3. Fry 2 eggs to your liking.\n4. Spread avocado on toast and top with eggs. Serve warm." },
        { id: 'f-2', title: 'Grilled Chicken Salad', type: 'Recipes', calories: 450, p: 45, c: 12, f: 20, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', favorite: true, recipeIngredients: "150g chicken breast\n2 cups chopped romaine lettuce\n1/2 cup cherry tomatoes halved\n1/2 cucumber sliced\n1 tbsp olive oil dressing", recipeSteps: "1. Season chicken breast with olive oil, salt, garlic powder, and pepper.\n2. Grill or pan-fry chicken breast for 6 mins per side.\n3. Chop romaine lettuce, cherry tomatoes, and cucumbers.\n4. Slice chicken and place on salad greens. Drizzle with light olive oil dressing." },
        { id: 'f-3', title: 'Greek Yogurt Bowl', type: 'Recipes', calories: 250, p: 20, c: 30, f: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', favorite: true, recipeIngredients: "1 cup plain Greek yogurt\n1/2 cup fresh mixed berries\n1 tbsp chia seeds\n1 tsp honey", recipeSteps: "1. Scoop Greek yogurt into a bowl.\n2. Top with mixed fresh berries (strawberries, blueberries).\n3. Sprinkle chia seeds and drizzle 1 tsp honey on top." },
        { id: 'f-4', title: 'Baked Salmon & Quinoa', type: 'Recipes', calories: 520, p: 38, c: 45, f: 22, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon fillet\n1/2 cup cooked quinoa\n8-10 stalks of fresh asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "1. Pre-heat oven to 400°F (200°C).\n2. Place salmon fillet on a baking sheet, drizzle with olive oil and squeeze fresh lemon.\n3. Bake for 12-15 minutes.\n4. Serve alongside cooked quinoa and steamed asparagus." },
        { id: 'f-5', title: 'Fresh Apple & Almonds', type: 'Raw Foods', calories: 150, p: 4, c: 18, f: 9, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', favorite: false, recipeIngredients: "1 medium apple\n12 raw almonds", recipeSteps: "Serve fresh apple sliced with raw almonds." },
        { id: 'f-6', title: 'Mixed Raw Berries', type: 'Raw Foods', calories: 85, p: 1, c: 21, f: 0.5, image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=200', favorite: false, recipeIngredients: "1/2 cup fresh strawberries\n1/4 cup blueberries\n1/4 cup raspberries", recipeSteps: "Rinse berries and serve in a small bowl." },
        { id: 'f-7', title: 'Berry Protein Smoothie Bowl', type: 'Recipes', calories: 350, p: 30, c: 45, f: 8, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200', favorite: true, recipeIngredients: "1 cup frozen mixed berries\n1 scoop vanilla whey protein powder\n1/2 cup almond milk\n1 tbsp chia seeds\nHandful of fresh raspberries for topping", recipeSteps: "Blend the frozen berries, protein powder, and almond milk until thick and smooth. Pour into a bowl, then top with chia seeds and fresh raspberries. Serve cold." },
        { id: 'f-8', title: 'Quinoa Buddha Bowl', type: 'Recipes', calories: 450, p: 15, c: 65, f: 18, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200', favorite: true, recipeIngredients: "1/2 cup cooked quinoa\n1/2 sweet potato\n1/2 avocado\n1 cup spinach\n2 tbsp lemon tahini dressing", recipeSteps: "Arrange spinach, quinoa, sweet potato, and avocado. Drizzle dressing." },
        { id: 'f-9', title: 'Mixed Nuts & Apple', type: 'Raw Foods', calories: 200, p: 5, c: 25, f: 10, image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=200', favorite: false, recipeIngredients: "1 small apple\n1 oz mixed nuts", recipeSteps: "Slice apple and serve with nuts." },
        { id: 'f-10', title: 'Grilled Salmon & Asparagus', type: 'Recipes', calories: 520, p: 42, c: 12, f: 32, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon\n1 bunch asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "Brush with oil, grill salmon and asparagus, drizzle with lemon juice." }
    ],
    programs: [],
    editingProgramId: null,
    adminSelectedFoodFilter: 'all',
    adminCalendarOffset: 0,
    clientsPage: 0
};

let draftedRecipients = [];


// ==================== SESSION CHECK ====================
function checkAdminSession() {
    if (localStorage.getItem('nutriflow_admin_logged') !== 'true') {
        window.location.href = './login.html';
    }
}

// ==================== STATE SYNC ====================
window.loadAdminState = function loadAdminState() {
    // Clear old mismatched cached states (e.g. Smoothie Bowl using Avocado Toast image or old googleusercontent links)
    const storedPlans = localStorage.getItem('nutriflow_client_meal_plans');
    const storedLib = localStorage.getItem('nutriflow_food_library');
    const storedDraft = localStorage.getItem('nutriflow_programs_draft');
    if (storedLib && (storedLib.includes('photo-1596560548464-f01068e3dbf0') || storedLib.includes('photo-1514733670139-4d87a19ec157') || !storedLib.includes('f-10'))) {
        localStorage.removeItem('nutriflow_food_library');
    }
    // Clear old incomplete program draft (missing Thu/Fri/Sat/Sun for Sarah)
    if (storedDraft) {
        try {
            const drafts = JSON.parse(storedDraft);
            const sarahProg = drafts.find(p => p.id === 'prog-sarah');
            if (sarahProg && (!sarahProg.meals['Thu'] || sarahProg.meals['Thu'].length === 0)) {
                localStorage.removeItem('nutriflow_programs_draft');
                localStorage.removeItem('nutriflow_client_meal_plans');
                localStorage.removeItem('nutriflow_clients');
            }
        } catch(e) { localStorage.removeItem('nutriflow_programs_draft'); }
    }
    if (storedPlans && (storedPlans.includes('lh3.googleusercontent.com') || storedPlans.includes('photo-1596560548464-f01068e3dbf0') || storedPlans.includes('photo-1514733670139-4d87a19ec157') || (storedPlans.includes('Smoothie Bowl') && storedPlans.includes('photo-1525351484163-7529414344d8')))) {
        localStorage.removeItem('nutriflow_client_meal_plans');
        localStorage.removeItem('nutriflow_programs_draft');
        localStorage.removeItem('nutriflow_clients');
    }

    // Clean random test chat messages (sdkahfifj and dsdskdhdhd)
    const storedChats = localStorage.getItem('nutriflow_program_chats');
    if (storedChats && (storedChats.includes('sdkahfifj') || storedChats.includes('dsdskdhdhd'))) {
        try {
            const chats = JSON.parse(storedChats);
            chats.forEach(chat => {
                if (chat.chatHistory) {
                    chat.chatHistory = chat.chatHistory.filter(msg => {
                        const txt = (msg.text || '').toLowerCase();
                        return !txt.includes('sdkahfifj') && !txt.includes('dsdskdhdhd');
                    });
                }
            });
            localStorage.setItem('nutriflow_program_chats', JSON.stringify(chats));
        } catch(e) {
            console.error("Error cleaning chat history:", e);
        }
    }

    // Helper to get formatted relative date (YYYY-MM-DD)
    const getRelativeDate = (offsetDays) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    // Load appointments booked by Client
    if (localStorage.getItem('nutriflow_appointments')) {
        state.appointments = JSON.parse(localStorage.getItem('nutriflow_appointments'));
    } else {
        state.appointments = [
            {
                id: 'apt-1',
                clientName: 'Sarah Jenkins',
                clientEmail: 'sarah.j@email.com',
                serviceId: 'initial-consultation',
                serviceTitle: 'Monthly Progress Review',
                price: 150,
                duration: '60 min',
                therapist: 'Dr. Sarah Jenkins',
                date: getRelativeDate(0),
                time: '10:00 AM',
                status: 'approved',
                type: 'Video Call'
            },
            {
                id: 'apt-2',
                clientName: 'Sarah Jenkins',
                clientEmail: 'sarah.j@email.com',
                serviceId: 'follow-up',
                serviceTitle: 'Meal Plan Adjustment',
                price: 75,
                duration: '30 min',
                therapist: 'Mark Davies',
                date: getRelativeDate(5),
                time: '02:30 PM',
                status: 'approved',
                type: 'In-Person'
            },
            {
                id: 'apt-3',
                clientName: 'Michael Chang',
                clientEmail: 'm.chang@email.com',
                serviceId: 'follow-up',
                serviceTitle: 'Follow-up & Macros Review',
                price: 75,
                duration: '30 min',
                therapist: 'Dr. Eleanor Vance, RD',
                date: getRelativeDate(-2),
                time: '02:00 PM',
                status: 'approved',
                type: 'Video Call'
            },
            {
                id: 'apt-4',
                clientName: 'Emma Watson',
                clientEmail: 'emma@email.com',
                serviceId: 'body-composition',
                serviceTitle: 'Dietary Adjustments Scan',
                price: 120,
                duration: '45 min',
                therapist: 'Dr. Sarah Jenkins',
                date: getRelativeDate(2),
                time: '03:30 PM',
                status: 'approved',
                type: 'In-Person'
            }
        ];
        saveAdminState();
    }
    
    // Load Programs Draft
    if (localStorage.getItem('nutriflow_programs_draft')) {
        state.programs = JSON.parse(localStorage.getItem('nutriflow_programs_draft'));
    } else {
        // Init default programs
        state.programs = [
            {
                id: 'prog-sarah',
                name: 'Sarah\'s Weight Loss Plan',
                description: 'Weekly meal program designed to help Sarah lose weight safely through balanced nutrients.',
                creator: 'Dr. Hasan',
                targetKcal: 2000,
                meals: {
                    'Mon': [
                        { type: 'Breakfast', title: 'Avocado Egg Toast', calories: 320, p: 14, c: 22, f: 18, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200', favorite: true, recipeIngredients: "2 slices whole wheat bread\n1 ripe avocado\n2 large eggs\n1 tsp lemon juice\nPinch of salt and black pepper", recipeSteps: "1. Toast 2 slices of whole wheat bread.\n2. Mash 1 avocado with lemon juice, salt, and pepper.\n3. Fry 2 eggs to your liking.\n4. Spread avocado on toast and top with eggs. Serve warm." },
                        { type: 'Lunch', title: 'Grilled Chicken Salad', calories: 450, p: 45, c: 12, f: 20, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', favorite: true, recipeIngredients: "150g chicken breast\n2 cups chopped romaine lettuce\n1/2 cup cherry tomatoes halved\n1/2 cucumber sliced\n1 tbsp olive oil dressing", recipeSteps: "1. Season chicken breast with olive oil, salt, garlic powder, and pepper.\n2. Grill or pan-fry chicken breast for 6 mins per side.\n3. Chop romaine lettuce, cherry tomatoes, and cucumbers.\n4. Slice chicken and place on salad greens. Drizzle with light olive oil dressing." },
                        { type: 'Snack', title: 'Fresh Apple & Almonds', calories: 150, p: 4, c: 18, f: 9, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', favorite: false, recipeIngredients: "1 medium apple\n12 raw almonds", recipeSteps: "Serve fresh apple sliced with raw almonds." },
                        { type: 'Dinner', title: 'Baked Salmon & Quinoa', calories: 520, p: 38, c: 45, f: 22, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon fillet\n1/2 cup cooked quinoa\n8-10 stalks of fresh asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "1. Pre-heat oven to 400°F (200°C).\n2. Place salmon fillet on a baking sheet, drizzle with olive oil and squeeze fresh lemon.\n3. Bake for 12-15 minutes.\n4. Serve alongside cooked quinoa and steamed asparagus." }
                    ],
                    'Tue': [
                        { type: 'Breakfast', title: 'Greek Yogurt Bowl', calories: 250, p: 20, c: 30, f: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', favorite: true, recipeIngredients: "1 cup plain Greek yogurt\n1/2 cup fresh mixed berries\n1 tbsp chia seeds\n1 tsp honey", recipeSteps: "1. Scoop Greek yogurt into a bowl.\n2. Top with mixed fresh berries (strawberries, blueberries).\n3. Sprinkle chia seeds and drizzle 1 tsp honey on top." },
                        { type: 'Lunch', title: 'Quinoa Buddha Bowl', calories: 450, p: 15, c: 65, f: 18, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200', favorite: true, recipeIngredients: "1/2 cup cooked quinoa\n1/2 sweet potato\n1/2 avocado\n1 cup spinach\n2 tbsp lemon tahini dressing", recipeSteps: "Arrange spinach, quinoa, sweet potato, and avocado. Drizzle dressing." },
                        { type: 'Snack', title: 'Mixed Raw Berries', calories: 85, p: 1, c: 21, f: 0.5, image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=200', favorite: false, recipeIngredients: "1/2 cup fresh strawberries\n1/4 cup blueberries\n1/4 cup raspberries", recipeSteps: "Rinse berries and serve in a small bowl." },
                        { type: 'Dinner', title: 'Grilled Salmon & Asparagus', calories: 520, p: 42, c: 12, f: 32, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon\n1 bunch asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "Brush with oil, grill salmon and asparagus, drizzle with lemon juice." }
                    ],
                    'Wed': [
                        { type: 'Breakfast', title: 'Berry Protein Smoothie Bowl', calories: 350, p: 30, c: 45, f: 8, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200', favorite: true, recipeIngredients: "1 cup frozen mixed berries\n1 scoop vanilla whey protein powder\n1/2 cup almond milk\n1 tbsp chia seeds", recipeSteps: "Blend berries, protein powder, and almond milk. Pour into a bowl and top with chia seeds." },
                        { type: 'Lunch', title: 'Quinoa Buddha Bowl', calories: 450, p: 15, c: 65, f: 18, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200', favorite: true, recipeIngredients: "1/2 cup cooked quinoa\n1/2 sweet potato\n1/2 avocado\n1 cup spinach\n2 tbsp lemon tahini dressing", recipeSteps: "Arrange spinach, quinoa, sweet potato, and avocado. Drizzle dressing." },
                        { type: 'Snack', title: 'Mixed Nuts & Apple', calories: 200, p: 5, c: 25, f: 10, image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=200', favorite: false, recipeIngredients: "1 small apple\n1 oz mixed nuts", recipeSteps: "Slice apple and serve with nuts." },
                        { type: 'Dinner', title: 'Grilled Salmon & Asparagus', calories: 520, p: 42, c: 12, f: 32, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon\n1 bunch asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "Brush with oil, grill salmon and asparagus, drizzle with lemon juice." }
                    ],
                    'Thu': [
                        { type: 'Breakfast', title: 'Avocado Egg Toast', calories: 320, p: 14, c: 22, f: 18, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200', favorite: true, recipeIngredients: "2 slices whole wheat bread\n1 ripe avocado\n2 large eggs\n1 tsp lemon juice\nPinch of salt and black pepper", recipeSteps: "1. Toast 2 slices of whole wheat bread.\n2. Mash 1 avocado with lemon juice, salt, and pepper.\n3. Fry 2 eggs to your liking.\n4. Spread avocado on toast and top with eggs. Serve warm." },
                        { type: 'Lunch', title: 'Grilled Chicken Salad', calories: 450, p: 45, c: 12, f: 20, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', favorite: true, recipeIngredients: "150g chicken breast\n2 cups chopped romaine lettuce\n1/2 cup cherry tomatoes halved\n1/2 cucumber sliced\n1 tbsp olive oil dressing", recipeSteps: "1. Season chicken breast with olive oil, salt, garlic powder, and pepper.\n2. Grill or pan-fry chicken breast for 6 mins per side.\n3. Chop romaine lettuce, cherry tomatoes, and cucumbers.\n4. Slice chicken and place on salad greens. Drizzle with light olive oil dressing." },
                        { type: 'Snack', title: 'Fresh Apple & Almonds', calories: 150, p: 4, c: 18, f: 9, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', favorite: false, recipeIngredients: "1 medium apple\n12 raw almonds", recipeSteps: "Serve fresh apple sliced with raw almonds." },
                        { type: 'Dinner', title: 'Baked Salmon & Quinoa', calories: 520, p: 38, c: 45, f: 22, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon fillet\n1/2 cup cooked quinoa\n8-10 stalks of fresh asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "1. Pre-heat oven to 400°F (200°C).\n2. Place salmon fillet on a baking sheet, drizzle with olive oil and squeeze fresh lemon.\n3. Bake for 12-15 minutes.\n4. Serve alongside cooked quinoa and steamed asparagus." }
                    ],
                    'Fri': [
                        { type: 'Breakfast', title: 'Greek Yogurt Bowl', calories: 250, p: 20, c: 30, f: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', favorite: true, recipeIngredients: "1 cup plain Greek yogurt\n1/2 cup fresh mixed berries\n1 tbsp chia seeds\n1 tsp honey", recipeSteps: "1. Scoop Greek yogurt into a bowl.\n2. Top with mixed fresh berries (strawberries, blueberries).\n3. Sprinkle chia seeds and drizzle 1 tsp honey on top." },
                        { type: 'Lunch', title: 'Quinoa Buddha Bowl', calories: 450, p: 15, c: 65, f: 18, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200', favorite: true, recipeIngredients: "1/2 cup cooked quinoa\n1/2 sweet potato\n1/2 avocado\n1 cup spinach\n2 tbsp lemon tahini dressing", recipeSteps: "Arrange spinach, quinoa, sweet potato, and avocado. Drizzle dressing." },
                        { type: 'Snack', title: 'Mixed Raw Berries', calories: 85, p: 1, c: 21, f: 0.5, image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=200', favorite: false, recipeIngredients: "1/2 cup fresh strawberries\n1/4 cup blueberries\n1/4 cup raspberries", recipeSteps: "Rinse berries and serve in a small bowl." },
                        { type: 'Dinner', title: 'Grilled Salmon & Asparagus', calories: 520, p: 42, c: 12, f: 32, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon\n1 bunch asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "Brush with oil, grill salmon and asparagus, drizzle with lemon juice." }
                    ],
                    'Sat': [
                        { type: 'Breakfast', title: 'Berry Protein Smoothie Bowl', calories: 350, p: 30, c: 45, f: 8, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200', favorite: true, recipeIngredients: "1 cup frozen mixed berries\n1 scoop vanilla whey protein powder\n1/2 cup almond milk\n1 tbsp chia seeds", recipeSteps: "Blend berries, protein powder, and almond milk. Pour into a bowl and top with chia seeds." },
                        { type: 'Lunch', title: 'Grilled Chicken Salad', calories: 450, p: 45, c: 12, f: 20, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', favorite: true, recipeIngredients: "150g chicken breast\n2 cups chopped romaine lettuce\n1/2 cup cherry tomatoes halved\n1/2 cucumber sliced\n1 tbsp olive oil dressing", recipeSteps: "1. Season chicken breast with olive oil, salt, garlic powder, and pepper.\n2. Grill or pan-fry chicken breast for 6 mins per side.\n3. Chop romaine lettuce, cherry tomatoes, and cucumbers.\n4. Slice chicken and place on salad greens. Drizzle with light olive oil dressing." },
                        { type: 'Snack', title: 'Mixed Nuts & Apple', calories: 200, p: 5, c: 25, f: 10, image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=200', favorite: false, recipeIngredients: "1 small apple\n1 oz mixed nuts", recipeSteps: "Slice apple and serve with nuts." },
                        { type: 'Dinner', title: 'Baked Salmon & Quinoa', calories: 520, p: 38, c: 45, f: 22, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon fillet\n1/2 cup cooked quinoa\n8-10 stalks of fresh asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "1. Pre-heat oven to 400°F (200°C).\n2. Place salmon fillet on a baking sheet, drizzle with olive oil and squeeze fresh lemon.\n3. Bake for 12-15 minutes.\n4. Serve alongside cooked quinoa and steamed asparagus." }
                    ],
                    'Sun': [
                        { type: 'Breakfast', title: 'Greek Yogurt Bowl', calories: 250, p: 20, c: 30, f: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', favorite: true, recipeIngredients: "1 cup plain Greek yogurt\n1/2 cup fresh mixed berries\n1 tbsp chia seeds\n1 tsp honey", recipeSteps: "1. Scoop Greek yogurt into a bowl.\n2. Top with mixed fresh berries (strawberries, blueberries).\n3. Sprinkle chia seeds and drizzle 1 tsp honey on top." },
                        { type: 'Lunch', title: 'Quinoa Buddha Bowl', calories: 450, p: 15, c: 65, f: 18, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200', favorite: true, recipeIngredients: "1/2 cup cooked quinoa\n1/2 sweet potato\n1/2 avocado\n1 cup spinach\n2 tbsp lemon tahini dressing", recipeSteps: "Arrange spinach, quinoa, sweet potato, and avocado. Drizzle dressing." },
                        { type: 'Snack', title: 'Fresh Apple & Almonds', calories: 150, p: 4, c: 18, f: 9, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', favorite: false, recipeIngredients: "1 medium apple\n12 raw almonds", recipeSteps: "Serve fresh apple sliced with raw almonds." },
                        { type: 'Dinner', title: 'Grilled Salmon & Asparagus', calories: 520, p: 42, c: 12, f: 32, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200', favorite: true, recipeIngredients: "150g salmon\n1 bunch asparagus\n1 tbsp lemon juice\n1 tsp olive oil", recipeSteps: "Brush with oil, grill salmon and asparagus, drizzle with lemon juice." }
                    ]
                }
            },
            {
                id: 'prog-marcus',
                name: 'Marcus\'s Muscle Gain Protocol',
                description: 'High-protein diet customized to fuel muscle hypertrophy and support intense workout recovery.',
                creator: 'Dr. Hasan',
                targetKcal: 2500,
                meals: {
                    'Mon': [
                        { type: 'Breakfast', title: 'Greek Yogurt Bowl', calories: 250, p: 20, c: 30, f: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', favorite: true, recipeIngredients: "1 cup plain Greek yogurt\n1/2 cup fresh mixed berries\n1 tbsp chia seeds\n1 tsp honey", recipeSteps: "1. Scoop Greek yogurt into a bowl.\n2. Top with mixed fresh berries (strawberries, blueberries).\n3. Sprinkle chia seeds and drizzle 1 tsp honey on top." }
                    ],
                    'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': [], 'Sun': []
                }
            },
            {
                id: 'prog-elena',
                name: 'Elena\'s Maintenance Program',
                description: 'General balanced diet with healthy snacks to keep energy levels stable and maintain body weight.',
                creator: 'Dr. Amanda',
                targetKcal: 1800,
                meals: {
                    'Mon': [
                        { type: 'Lunch', title: 'Grilled Chicken Salad', calories: 450, p: 45, c: 12, f: 20, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', favorite: true, recipeIngredients: "150g chicken breast\n2 cups chopped romaine lettuce\n1/2 cup cherry tomatoes halved\n1/2 cucumber sliced\n1 tbsp olive oil dressing", recipeSteps: "1. Season chicken breast with olive oil, salt, garlic powder, and pepper.\n2. Grill or pan-fry chicken breast for 6 mins per side.\n3. Chop romaine lettuce, cherry tomatoes, and cucumbers.\n4. Slice chicken and place on salad greens. Drizzle with light olive oil dressing." }
                    ],
                    'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': [], 'Sun': []
                }
            }
        ];
        localStorage.setItem('nutriflow_programs_draft', JSON.stringify(state.programs));
    }

    // Load Food Library
    if (localStorage.getItem('nutriflow_food_library')) {
        state.foodLibrary = JSON.parse(localStorage.getItem('nutriflow_food_library'));
    } else {
        localStorage.setItem('nutriflow_food_library', JSON.stringify(state.foodLibrary));
    }

    // Load Clients List
    if (localStorage.getItem('nutriflow_clients')) {
        state.clients = JSON.parse(localStorage.getItem('nutriflow_clients'));
        let updated = false;
        state.clients.forEach(c => {
            if (!c.therapist) {
                if (c.name === 'Elena Lopez') {
                    c.therapist = 'Dr. Amanda';
                } else {
                    c.therapist = 'Dr. Hasan';
                }
                updated = true;
            }
            if (!c.activeProgramId) {
                if (c.name === 'Sarah Jenkins') c.activeProgramId = 'prog-sarah';
                else if (c.name === 'Marcus Reid') c.activeProgramId = 'prog-marcus';
                else if (c.name === 'Elena Lopez') c.activeProgramId = 'prog-elena';
                updated = true;
            }
            if (c.compliance === undefined || c.compliance === null) {
                c.compliance = 85;
                updated = true;
            }
            if (!c.weightTrend || !Array.isArray(c.weightTrend) || c.weightTrend.length === 0) {
                c.weightTrend = [160, 159, 158, 158, 157, 156];
                updated = true;
            }
            if (!c.avatar) {
                c.avatar = c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CL';
                updated = true;
            }
            if (!c.goal) {
                c.goal = 'Weight Loss';
                updated = true;
            }
            if (!c.lastCheckIn) {
                c.lastCheckIn = 'Never';
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('nutriflow_clients', JSON.stringify(state.clients));
        }
    } else {
        localStorage.setItem('nutriflow_clients', JSON.stringify(state.clients));
    }

    // Initialize default client meal plans linked to activeProgramId if not present
    if (!localStorage.getItem('nutriflow_client_meal_plans')) {
        const defaultClients = JSON.parse(localStorage.getItem('nutriflow_clients')) || state.clients;
        const defaultPrograms = JSON.parse(localStorage.getItem('nutriflow_programs_draft')) || state.programs;
        const initialMealPlans = {};
        
        defaultClients.forEach(c => {
            if (c.activeProgramId) {
                const program = defaultPrograms.find(p => p.id === c.activeProgramId);
                if (program) {
                    initialMealPlans[c.name] = JSON.parse(JSON.stringify(program.meals || {}));
                }
            }
        });
        localStorage.setItem('nutriflow_client_meal_plans', JSON.stringify(initialMealPlans));
    }
}

function saveAdminState() {
    localStorage.setItem('nutriflow_appointments', JSON.stringify(state.appointments));
    localStorage.setItem('nutriflow_programs_draft', JSON.stringify(state.programs));
    localStorage.setItem('nutriflow_clients', JSON.stringify(state.clients));
    localStorage.setItem('nutriflow_food_library', JSON.stringify(state.foodLibrary));
}

// ==================== INITIALIZATION ====================
// document.addEventListener('DOMContentLoaded', () => {
//     initAdminApp();
// });

// ==================== SAAS BILLING / SUBSCRIPTION ====================
window.openSaaSUpgradeModal = function() {
    const modal = document.getElementById('saas-upgrade-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderSaaSPlansGrid();
};

window.closeSaaSUpgradeModal = function() {
    const modal = document.getElementById('saas-upgrade-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.renderSaaSPlansGrid = function() {
    const grid = document.getElementById('saas-plans-grid');
    if (!grid) return;
    
    // Read B2B SaaS plans set by Control Center
    let plans = JSON.parse(localStorage.getItem('nutriflow_subscription_plans') || '[]');
    
    // FALLBACK if plans are empty (Control Center hasn't been visited yet)
    if (!plans || plans.length === 0) {
        plans = [
            { id: 'plan-free',    name: 'Basic EHR',    price: 0,  color: 'slate',   icon: 'badge',             description: 'Start your private practice with zero overhead.',          features: ['Standard EHR & Charting', 'Client Portal Access', 'Up to 3 Active Clients', 'Manual Insurance Billing'] },
            { id: 'plan-pro',     name: 'Pro SaaS',     price: 49, color: 'primary', icon: 'auto_awesome',      description: 'The ultimate tool for independent specialists.',           features: ['Unlimited Clients', 'AI ADIME Scribe (Unlimited)', '0% Aggregator Commission', 'Direct-to-Insurance Billing', 'Custom Branding'], recommended: true },
            { id: 'plan-clinic',  name: 'Clinic Team',  price: 149, color: 'amber',   icon: 'domain',            description: 'Scale your practice with multiple practitioners.',        features: ['Up to 5 Practitioners', 'Advanced Analytics', 'Multi-Specialist Routing', 'All Pro SaaS Features'] }
        ];
        localStorage.setItem('nutriflow_subscription_plans', JSON.stringify(plans));
    }

    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');

    const PLAN_STYLES = {
        'slate':   { badge: 'bg-slate-100 text-slate-600',    card: 'border-slate-200',           btn: 'bg-slate-800 hover:bg-slate-700 text-white',  icon: 'text-slate-500',   iconBg: 'bg-slate-500/20' },
        'blue':    { badge: 'bg-blue-100 text-blue-700',      card: 'border-blue-200',             btn: 'bg-blue-600 hover:bg-blue-500 text-white',    icon: 'text-blue-500',    iconBg: 'bg-blue-500/20' },
        'primary': { badge: 'bg-primary/10 text-primary',     card: 'border-primary ring-2 ring-primary/30', btn: 'bg-primary hover:bg-[#005321] text-white', icon: 'text-primary', iconBg: 'bg-primary/20' },
        'amber':   { badge: 'bg-amber-100 text-amber-700',    card: 'border-amber-300',            btn: 'bg-amber-500 hover:bg-amber-400 text-white',  icon: 'text-amber-500',   iconBg: 'bg-amber-400/20' }
    };

    grid.innerHTML = plans.map(plan => {
        const style = PLAN_STYLES[plan.color] || PLAN_STYLES['slate'];
        const isActive = plan.id === sub.planId;
        const isRec = plan.recommended;
        
        const featList = plan.features.map(f => 
            `<li class="flex items-start gap-1.5 text-[11px] text-on-surface-variant"><span class="material-symbols-outlined text-emerald-500 text-[14px] mt-px" style="font-variation-settings:'FILL' 1">check_circle</span>${f}</li>`
        ).join('');

        const btnLabel = isActive ? '✓ Current SaaS Plan' : (plan.price === 0 ? 'Switch to Free' : `Upgrade to ${plan.name} — RM${plan.price}/mo`);
        const btnClass = isActive 
            ? 'w-full font-bold text-xs py-2.5 rounded-xl bg-emerald-500 text-white cursor-default' 
            : `w-full font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${style.btn}`;

        return `<div class="relative flex flex-col rounded-2xl border-2 p-5 gap-4 ${style.card}${isActive ? ' shadow-lg' : ''}">
            ${isRec ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">Most Popular</div>' : ''}
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}">
                    <span class="material-symbols-outlined text-xl ${style.icon}" style="font-variation-settings:'FILL' 1">${plan.icon}</span>
                </div>
                <div>
                    <h4 class="font-black text-on-surface text-base">${plan.name}</h4>
                    <p class="text-[11px] text-on-surface-variant">${plan.price === 0 ? 'Free forever' : 'RM' + plan.price + '/mo'}</p>
                </div>
            </div>
            <p class="text-xs text-on-surface-variant">${plan.description}</p>
            <ul class="flex flex-col gap-1.5 flex-grow">${featList}</ul>
            <button onclick="confirmSaaSUpgrade('${plan.id}')" class="${btnClass}">${btnLabel}</button>
        </div>`;
    }).join('');
}

window.confirmSaaSUpgrade = function(planId) {
    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');
    if (sub.planId === planId) {
        showToast('You are already on this plan.', 'info');
        return;
    }
    
    localStorage.setItem('nutriflow_specialist_sub', JSON.stringify({ planId: planId }));
    closeSaaSUpgradeModal();
    renderBillingTab();
    showToast('SaaS Subscription updated successfully! 🚀', 'success');
};

window.renderBillingTab = function() {
    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');
    let plans = JSON.parse(localStorage.getItem('nutriflow_subscription_plans') || '[]');
    
    // Default fallback to Basic EHR if no plans found
    let activePlan = { id: 'plan-free', name: 'Basic EHR', price: 0, color: 'slate', icon: 'badge' };
    if (plans.length > 0) {
        const found = plans.find(p => p.id === sub.planId);
        if (found) activePlan = found;
    }

    const nameEl = document.getElementById('sp-plan-name');
    const priceEl = document.getElementById('sp-plan-price');
    const btn = document.getElementById('btn-upgrade-saas');
    const icon = document.getElementById('sp-plan-icon');
    const desc = document.getElementById('billing-status-desc');

    if (nameEl) nameEl.innerText = activePlan.name;
    if (priceEl) priceEl.innerHTML = `RM${activePlan.price}<span class="text-slate-400 text-sm font-normal">/mo</span>`;
    if (desc) desc.innerText = `You are currently on the ${activePlan.name} plan. Next billing cycle: 1st of next month.`;

    if (icon) {
        const iconBgs = { 'slate': 'bg-slate-700/50 border-slate-600', 'blue': 'bg-blue-500/20 border-blue-500/50', 'primary': 'bg-primary/20 border-primary/50', 'amber': 'bg-amber-500/20 border-amber-500/50' };
        const iconColors = { 'slate': 'text-white', 'blue': 'text-blue-400', 'primary': 'text-primary', 'amber': 'text-amber-400' };
        
        icon.className = `w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${iconBgs[activePlan.color] || iconBgs['slate']}`;
        icon.querySelector('span').className = `material-symbols-outlined text-2xl ${iconColors[activePlan.color] || iconColors['slate']}`;
        icon.querySelector('span').innerText = activePlan.icon || 'badge';
    }
}
function initAdminApp() {
    // loadAdminState(); // Disabled for MVC
    
    // Set subtitle welcome message with specialist name
    const activeSpecialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    const subtitle = document.getElementById('specialist-welcome-subtitle');
    if (subtitle) {
        subtitle.innerText = `Logged in as: ${activeSpecialist} · Manage your active nutrition clients and monitor their progress.`;
    }

    // Set practitioner avatar label
    const avatarLabel = document.getElementById('practitioner-avatar-label');
    if (avatarLabel) {
        const initials = activeSpecialist.split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase();
        avatarLabel.innerText = initials;
    }
    
    // navigateTo('admin-clients'); // Disabled for MVC
}

// ==================== TOASTS ====================
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Overwrite previous toasts instead of stacking them
    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl shadow-lg text-white font-semibold text-xs flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 border`;
    
    if (type === 'success') {
        toast.className += ' bg-[#006e2f] border-[#005321]';
    } else if (type === 'error') {
        toast.className += ' bg-red-600 border-red-800';
    } else {
        toast.className += ' bg-[#006a61] border-[#005049]';
    }

    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px]">${type === 'error' ? 'error' : 'check_circle'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 50);
    setTimeout(() => {
        toast.classList.add('translate-y-[-10px]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// ==================== ACCORDION ====================
window.toggleMobileAccordion = function(trElement) {
    if (!trElement) return;
    
    // Toggle class on tr
    trElement.classList.toggle('accordion-expanded');
    
    // Toggle hidden class on child accordion-contents
    trElement.querySelectorAll('.accordion-content').forEach(el => {
        el.classList.toggle('hidden');
    });
    
    // Toggle chevron icon
    const icon = trElement.querySelector('.accordion-chevron');
    if (icon) {
        const isExpanded = trElement.classList.contains('accordion-expanded');
        icon.innerText = isExpanded ? 'expand_less' : 'expand_more';
    }
};

// ==================== ROUTER ====================
window.navigateTo = function(viewId) {
    state.activeView = viewId;
    
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
    const activeSec = document.getElementById('view-' + viewId);
    if (activeSec) activeSec.classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.className = 'nav-link h-full flex items-center text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors px-3 cursor-pointer';
    });
    const activeLink = document.getElementById(`link-${viewId}`);
    if (activeLink) {
        activeLink.className = 'nav-link h-full flex items-center text-primary font-bold border-b-2 border-primary font-label-md text-label-md px-3 cursor-pointer';
    }

    // Toggle active state for mobile bottom nav
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.classList.remove('text-primary');
        link.classList.add('text-on-surface-variant');
    });
    const activeMobileLink = document.getElementById(`mobile-link-${viewId}`);
    if (activeMobileLink) {
        activeMobileLink.classList.remove('text-on-surface-variant');
        activeMobileLink.classList.add('text-primary');
    }

    if (viewId === 'admin-clients') {
        renderAdminClientsList();
    } else if (viewId === 'admin-meal-builder') {
        renderAdminMealBuilder();
    } else if (viewId === 'admin-calendar') {
        renderAdminAppointmentsTable();
    } else if (viewId === 'admin-services') {
        loadSpecialistServices();
    } else if (viewId === 'admin-profile') {
        loadSpecialistProfileDetails();
    } else if (viewId === 'admin-food-scans') {
        renderAdminScanHub();
        updateScanBadge();
    }
};

window.handleAdminSignOut = function() {
    localStorage.removeItem('nutriflow_admin_logged');
    showToast('Signed out of Admin account.');
    setTimeout(() => {
        window.location.href = './login.html';
    }, 1000);
};

function loadSpecialistProfileDetails() {
    const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    // Find specialist details from the state/local storage of nutritionists
    const nutritionists = JSON.parse(localStorage.getItem('nutriflow_nutritionists')) || [
        { id: 'exp-1', name: 'Dr. Hasan', email: 'hasan@nutriflow.com', specialty: 'Weight Management', status: 'active', avatar: 'DH' },
        { id: 'exp-2', name: 'Dr. Amanda', email: 'amanda@nutriflow.com', specialty: 'Sport Nutrition', status: 'active', avatar: 'DA' },
        { id: 'exp-3', name: 'Dr. Marcus Reid', email: 'm.reid@email.com', specialty: 'Therapeutic Diets', status: 'active', avatar: 'MR' }
    ];
    
    const spec = nutritionists.find(n => n.name === activeSpecialistName) || {
        name: activeSpecialistName,
        email: 'specialist@nutriflow.com',
        specialty: 'Weight Management',
        avatar: activeSpecialistName.split(' ').map(s => s[0]).join('').toUpperCase()
    };

    // Populate Left Card
    document.getElementById('profile-practitioner-avatar').innerText = spec.avatar || 'N';
    document.getElementById('profile-practitioner-name').innerText = spec.name;
    document.getElementById('profile-practitioner-specialty').innerText = spec.specialty;
    document.getElementById('profile-practitioner-email').innerText = spec.email;

    // Populate Right Form
    document.getElementById('edit-practitioner-name').value = spec.name;
    document.getElementById('edit-practitioner-specialty').value = spec.specialty;
    document.getElementById('edit-practitioner-email').value = spec.email;

    // Render Specialist Reviews
    const allReviews = JSON.parse(localStorage.getItem('nutriflow_specialist_reviews') || '[]');
    const specReviews = allReviews.filter(r => r.specialist.toLowerCase() === spec.name.toLowerCase());
    
    const ratingEl = document.getElementById('admin-profile-rating-num');
    if (ratingEl) {
        if (specReviews.length > 0) {
            const sum = specReviews.reduce((acc, r) => acc + r.rating, 0);
            ratingEl.innerText = (sum / specReviews.length).toFixed(1);
        } else {
            ratingEl.innerText = '5.0';
        }
    }

    const reviewsListEl = document.getElementById('admin-profile-reviews-list');
    if (reviewsListEl) {
        if (specReviews.length === 0) {
            reviewsListEl.innerHTML = `<div class="p-4 text-center text-xs text-on-surface-variant font-medium">No client reviews received yet.</div>`;
        } else {
            reviewsListEl.innerHTML = specReviews.map(r => `
                <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/15 flex flex-col gap-1 text-left">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-xs text-on-background">${r.clientName}</span>
                        <span class="text-[9px] text-on-surface-variant">${r.date}</span>
                    </div>
                    <div class="text-amber-500 text-xs">
                        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                    </div>
                    <p class="text-xs text-on-surface-variant leading-snug">${r.comment}</p>
                </div>
            `).join('');
        }
    }

    if (typeof renderBillingTab === 'function') {
        renderBillingTab();
    }
}

function loadSpecialistServices() {
    const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    const key = `nutriflow_services_${activeSpecialistName}`;
    
    let services = JSON.parse(localStorage.getItem(key));
    if (!services) {
        if (activeSpecialistName.includes('Hasan')) {
            services = [
                {
                    id: 'srv-hasan-1',
                    title: 'Weight Loss Consultation',
                    description: 'A dedicated session focusing on weight loss strategies, body composition targets, and custom macro ratios.',
                    duration: '60 min',
                    type: 'Virtual or In-Person',
                    price: 150,
                    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500'
                },
                {
                    id: 'srv-hasan-2',
                    title: 'Weekly Meal Review',
                    description: 'A 30-minute check-in to adjust your weekly calorie limits, recipes, and raw ingredients in your active program.',
                    duration: '30 min',
                    type: 'Virtual Only',
                    price: 75,
                    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500'
                }
            ];
        } else if (activeSpecialistName.includes('Amanda')) {
            services = [
                {
                    id: 'srv-amanda-1',
                    title: 'Sports Performance Nutrition',
                    description: 'Optimize your energy levels, muscle protein synthesis, and sports supplements to match your training cycles.',
                    duration: '60 min',
                    type: 'Virtual or In-Person',
                    price: 160,
                    image: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?w=500'
                }
            ];
        } else {
            services = [
                {
                    id: `srv-${Date.now()}-1`,
                    title: 'General Wellness Consultation',
                    description: 'Identify lifestyle habits, micronutrient deficiencies, and sleep profiles to improve general health.',
                    duration: '60 min',
                    type: 'Virtual or In-Person',
                    price: 120,
                    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500'
                }
            ];
        }
        localStorage.setItem(key, JSON.stringify(services));
    }
    
    renderSpecialistServicesList(services);
}

function renderSpecialistServicesList(services) {
    const listContainer = document.getElementById('specialist-services-list');
    if (!listContainer) return;
    
    if (services.length === 0) {
        listContainer.innerHTML = `
            <div class="col-span-full border border-dashed border-outline-variant/35 rounded-2xl p-8 text-center text-xs font-semibold text-on-surface-variant bg-surface-container-low/20">
                You have no consultation services registered. Click "Add Service" to create one.
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = services.map(srv => `
        <div class="bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div class="h-32 w-full bg-cover bg-center relative" style="background-image: url('${srv.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'}')">
                <div class="absolute top-3 right-3 bg-white/95 backdrop-blur shadow-sm px-2.5 py-1 rounded-xl text-xs font-black text-primary border border-outline-variant/10">
                    $${srv.price}
                </div>
            </div>
            <div class="p-5 flex flex-col flex-grow gap-2.5 text-xs text-on-background">
                <h4 class="font-extrabold text-on-background text-sm leading-snug">${srv.title}</h4>
                <p class="text-on-surface-variant text-[11px] leading-relaxed line-clamp-3">${srv.description}</p>
                
                <div class="flex flex-wrap gap-1.5 items-center mt-1">
                    <span class="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-lg text-[10px] font-bold text-on-surface-variant">
                        <span class="material-symbols-outlined text-[12px] text-primary">schedule</span> ${srv.duration}
                    </span>
                    <span class="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-lg text-[10px] font-bold text-on-surface-variant">
                        <span class="material-symbols-outlined text-[12px] text-primary">videocam</span> ${srv.type}
                    </span>
                </div>
                
                <div class="flex justify-end gap-2 border-t border-outline-variant/15 pt-3.5 mt-auto">
                    <button onclick="openEditServiceModal('${srv.id}')" class="bg-primary/5 hover:bg-primary/15 text-primary font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1">
                        <span class="material-symbols-outlined text-[13px]">edit</span> Edit
                    </button>
                    <button onclick="deleteSpecialistService('${srv.id}')" class="bg-red-50 hover:bg-red-100/80 text-red-600 font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1">
                        <span class="material-symbols-outlined text-[13px]">delete</span> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.openAddServiceModal = function() {
    document.getElementById('service-modal-title').innerText = 'Add Consultation Service';
    document.getElementById('service-modal-id').value = '';
    document.getElementById('service-modal-title-input').value = '';
    const descInput = document.getElementById('service-modal-description');
    if (descInput) {
        descInput.value = '';
        descInput.style.height = 'auto';
    }
    document.getElementById('service-modal-duration').value = '60 min';
    document.getElementById('service-modal-price').value = '150';
    document.getElementById('service-modal-type').value = 'Virtual or In-Person';
    
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.openEditServiceModal = function(srvId) {
    const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    const key = `nutriflow_services_${activeSpecialistName}`;
    const services = JSON.parse(localStorage.getItem(key)) || [];
    const srv = services.find(s => s.id === srvId);
    if (!srv) return;
    
    document.getElementById('service-modal-title').innerText = 'Edit Consultation Service';
    document.getElementById('service-modal-id').value = srv.id;
    document.getElementById('service-modal-title-input').value = srv.title;
    
    const descInput = document.getElementById('service-modal-description');
    if (descInput) {
        descInput.value = srv.description;
        // Trigger auto-resize after a short timeout or immediately when layout updates
        setTimeout(() => {
            descInput.style.height = 'auto';
            descInput.style.height = descInput.scrollHeight + 'px';
        }, 50);
    }
    
    document.getElementById('service-modal-duration').value = srv.duration;
    document.getElementById('service-modal-price').value = srv.price;
    document.getElementById('service-modal-type').value = srv.type;
    
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeServiceModal = function() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.handleSaveService = function(e) {
    e.preventDefault();
    const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    const key = `nutriflow_services_${activeSpecialistName}`;
    const services = JSON.parse(localStorage.getItem(key)) || [];
    
    const id = document.getElementById('service-modal-id').value;
    const title = document.getElementById('service-modal-title-input').value.trim();
    const description = document.getElementById('service-modal-description').value.trim();
    const duration = document.getElementById('service-modal-duration').value.trim();
    const price = parseInt(document.getElementById('service-modal-price').value);
    const type = document.getElementById('service-modal-type').value;
    
    const image = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200';
    
    if (id) {
        const idx = services.findIndex(s => s.id === id);
        if (idx !== -1) {
            services[idx].title = title;
            services[idx].description = description;
            services[idx].duration = duration;
            services[idx].price = price;
            services[idx].type = type;
        }
    } else {
        services.push({
            id: `srv-${Date.now()}`,
            title, description, duration, price, type, image
        });
    }
    
    localStorage.setItem(key, JSON.stringify(services));
    closeServiceModal();
    renderSpecialistServicesList(services);
    showToast('Consultation Service saved successfully!', 'success');
};

window.deleteSpecialistService = function(srvId) {
    if (confirm('Are you sure you want to remove this service offering?')) {
        const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
        const key = `nutriflow_services_${activeSpecialistName}`;
        const services = JSON.parse(localStorage.getItem(key)) || [];
        const filtered = services.filter(s => s.id !== srvId);
        localStorage.setItem(key, JSON.stringify(filtered));
        renderSpecialistServicesList(filtered);
        showToast('Service offering removed successfully.', 'info');
    }
};

window.handleSavePractitionerProfile = function(e) {
    e.preventDefault();
    const name = document.getElementById('edit-practitioner-name').value;
    const specialty = document.getElementById('edit-practitioner-specialty').value;
    const email = document.getElementById('edit-practitioner-email').value;
    const avatar = name.split(' ').map(s => s[0]).join('').substring(0,2).toUpperCase();

    const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    // Update nutriflow_nutritionists list
    const nutritionists = JSON.parse(localStorage.getItem('nutriflow_nutritionists')) || [];
    const index = nutritionists.findIndex(n => n.name === activeSpecialistName);
    if (index !== -1) {
        nutritionists[index].name = name;
        nutritionists[index].specialty = specialty;
        nutritionists[index].email = email;
        nutritionists[index].avatar = avatar;
    } else {
        nutritionists.push({
            id: `exp-${Date.now()}`,
            name, specialty, email, status: 'active', avatar
        });
    }
    localStorage.setItem('nutriflow_nutritionists', JSON.stringify(nutritionists));

    // Update clients pendamping name in client list to maintain allocation consistency!
    const clients = JSON.parse(localStorage.getItem('nutriflow_clients')) || [];
    clients.forEach(c => {
        if (c.therapist === activeSpecialistName) {
            c.therapist = name;
        }
    });
    localStorage.setItem('nutriflow_clients', JSON.stringify(clients));

    // Update session name
    localStorage.setItem('nutriflow_specialist_name', name);
    
    // Update UI headers
    const label = document.getElementById('practitioner-avatar-label');
    if (label) label.innerText = avatar;

    const welcomeLabel = document.getElementById('specialist-welcome-subtitle');
    if (welcomeLabel) {
        welcomeLabel.innerText = `Logged in as: ${name} · Manage your active nutrition clients and monitor their progress.`;
    }

    loadSpecialistProfileDetails();
    showToast('Practitioner Profile updated successfully!', 'success');
};

// Admin Notifications Dropdown
const adminNotificationsData = [
    { type: 'booking', message: 'New Appointment Request: Sarah Jenkins for Video Consultation', time: '5 mins ago', icon: 'event', bg: 'bg-[#fff8e1]', text: 'text-[#d48806]' },
    { type: 'progress', message: 'Mike Ross just logged his weekly weigh-in', time: '1 hour ago', icon: 'monitor_weight', bg: 'bg-[#e5f6fd]', text: 'text-[#0288d1]' },
    { type: 'cancelled', message: 'Booking Cancelled: Emma Stone (Tomorrow 10:00 AM)', time: '3 hours ago', icon: 'cancel', bg: 'bg-[#fce8e6]', text: 'text-[#d93025]' },
    { type: 'reminder', message: 'Upcoming Session in 30 mins: John Doe', time: 'Just now', icon: 'notifications_active', bg: 'bg-[#e6f4ea]', text: 'text-[#1e8e3e]' }
];

window.toggleSpecialistNotifications = function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('admin-notifications-dropdown');
    const isHidden = dropdown.classList.contains('hidden');
    
    if (isHidden) {
        renderAdminNotifications();
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
};

window.renderAdminNotifications = function() {
    const list = document.getElementById('admin-notifications-list');
    if (!list) return;
    
    if (adminNotificationsData.length === 0) {
        list.innerHTML = '<div class="p-6 text-center text-sm text-on-surface-variant">No new notifications</div>';
        return;
    }
    
    list.innerHTML = adminNotificationsData.map(n => `
        <div class="px-5 py-4 flex gap-4 hover:bg-surface-container transition-colors cursor-pointer items-start">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.bg} ${n.text}">
                <span class="material-symbols-outlined text-[20px]">${n.icon}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-[13px] font-medium text-on-background leading-snug">${n.message}</span>
                <span class="text-[11px] text-on-surface-variant mt-1">${n.time}</span>
            </div>
        </div>
    `).join('');
};

window.markAdminNotificationsRead = function() {
    adminNotificationsData.length = 0; // clear array
    renderAdminNotifications();
    showToast('All notifications marked as read', 'success');
    setTimeout(() => {
        document.getElementById('admin-notifications-dropdown').classList.add('hidden');
    }, 1000);
};

// Close dropdown on click outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('admin-notifications-dropdown');
    const btn = document.getElementById('admin-notifications-btn');
    if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    }
});

function generateSparklinePath(trend) {
    if (!trend || trend.length < 2) return "M 0 15 L 100 15";
    const minVal = Math.min(...trend);
    const maxVal = Math.max(...trend);
    const valRange = maxVal - minVal || 1;
    
    const points = trend.map((val, idx) => {
        const x = (idx / (trend.length - 1)) * 100;
        const y = 26 - ((val - minVal) / valRange) * 22;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    return `M ${points.join(' L ')}`;
}

// ==================== CLIENTS LIST ====================
function renderAdminClientsList() {
    const tbody = document.getElementById('admin-clients-table-body');
    if (!tbody) return;
    
    // Recalculate and update top KPIs dynamically
    const totalClients = state.clients.length;
    const avgCompliance = totalClients > 0 ? Math.round(state.clients.reduce((acc, c) => acc + c.compliance, 0) / totalClients) : 0;
    const consultationsToday = state.appointments.filter(a => a.status === 'approved').length;
    
    const metricClients = document.getElementById('admin-metric-clients');
    const metricCompliance = document.getElementById('admin-metric-compliance');
    const metricConsultations = document.getElementById('admin-metric-consultations');
    
    if (metricClients) metricClients.innerText = totalClients;
    if (metricCompliance) metricCompliance.innerText = `${avgCompliance}%`;
    if (metricConsultations) metricConsultations.innerText = consultationsToday;

    const query = document.getElementById('admin-client-search').value.toLowerCase();
    const goalFilter = document.getElementById('admin-client-filter-goal').value;
    const ownerFilter = document.getElementById('admin-client-filter-owner')?.value || 'mine';
    const activeSpecialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';

    const filtered = state.clients.filter(cli => {
        const matchesQuery = cli.name.toLowerCase().includes(query) || cli.email.toLowerCase().includes(query);
        const matchesGoal = goalFilter === 'all' || cli.goal === goalFilter;
        const matchesOwner = ownerFilter === 'all' || cli.therapist === activeSpecialist;
        return matchesQuery && matchesGoal && matchesOwner;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-on-surface-variant font-semibold">No clients matching current criteria.</td></tr>`;
        document.getElementById('admin-clients-count-label').innerText = 'Showing 0 clients';
        return;
    }

    // Pagination sizing
    const pageSize = 5;
    const maxPage = Math.ceil(filtered.length / pageSize) - 1;
    if (state.clientsPage > maxPage) state.clientsPage = Math.max(0, maxPage);
    
    const startIdx = state.clientsPage * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    // Fetch subscription data
    const globalSub = JSON.parse(localStorage.getItem('nutriflow_client_care_sub') || '{"planId":"plan-free"}');
    const plans = JSON.parse(localStorage.getItem('nutriflow_care_packages') || '[]');
    const colorClasses = {
        'slate': 'bg-slate-100 text-slate-700 border-slate-200/60',
        'blue': 'bg-blue-50 text-blue-700 border-blue-200/60',
        'primary': 'bg-primary/10 text-primary border-primary/20',
        'amber': 'bg-amber-50 text-amber-700 border-amber-200/60'
    };

    tbody.innerHTML = pageItems.map(cli => {
        // Assign the actual subscription to Sarah, others default to Pay-Per-Session
        let planName = 'Pay-Per-Session';
        let planColor = 'slate';
        if (cli.name === 'Sarah Jenkins' && plans.length > 0) {
            const p = plans.find(x => x.id === globalSub.planId);
            if (p) { planName = p.name; planColor = p.color; }
        }
        const badgeClass = colorClasses[planColor] || colorClasses['slate'];

        return `
            <tr class="flex flex-col lg:table-row bg-surface-container-lowest border border-outline-variant/30 lg:border-0 rounded-2xl p-4 lg:p-0 gap-3 mb-4 lg:mb-0 hover:bg-surface-container-low/30 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] lg:shadow-none">
                <!-- Client Card Header (Click to Expand on Mobile) -->
                <td onclick="toggleMobileAccordion(this.closest('tr'))" class="cursor-pointer lg:cursor-default flex justify-between items-center lg:table-cell p-0 lg:p-4 pl-0 lg:pl-6 text-left border-b border-outline-variant/15 lg:border-0 pb-3 lg:pb-4">
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                ${cli.avatar.startsWith('http') ? `<img class="w-full h-full object-cover" src="${cli.avatar}" alt="${cli.name}">` : cli.avatar}
                            </div>
                            <div class="text-left">
                                <div class="font-bold text-on-background text-sm lg:text-xs flex items-center gap-1.5">
                                    <span>${cli.name}</span>
                                    ${(cli.allergies?.length || cli.conditions?.length) ? `<span class="material-symbols-outlined text-amber-600 text-[14px]" title="Has Medical Intake Data">warning</span>` : ''}
                                </div>
                                <div class="text-[10px] text-on-surface-variant/80">${cli.email}</div>
                                <div class="flex flex-wrap gap-1 mt-1.5">
                                    <span class="${badgeClass} px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-0.5" title="Care Package Subscription"><span class="material-symbols-outlined text-[10px]">card_membership</span> ${planName}</span>
                                    ${cli.allergies && cli.allergies.length ? `<span class="bg-red-50 text-red-700 border border-red-200/60 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5" title="Allergies"><span class="material-symbols-outlined text-[10px]">no_food</span> ${cli.allergies.join(', ')}</span>` : ''}
                                    ${cli.conditions && cli.conditions.length ? `<span class="bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded text-[9px] font-bold" title="Conditions">${cli.conditions.join(', ')}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            <!-- Medical Intake button on mobile -->
                            <button onclick="event.stopPropagation(); openClientIntakeModal('${cli.email}')" class="lg:hidden p-2 bg-primary/5 hover:bg-primary/15 text-primary rounded-full transition-colors cursor-pointer" title="View Medical Intake">
                                <span class="material-symbols-outlined text-[18px]">medical_information</span>
                            </button>
                            <!-- Action chat button on mobile (hidden on desktop) -->
                            <button onclick="event.stopPropagation(); openClientProgramDiscussion('${cli.activeProgramId}', '${cli.name}')" class="lg:hidden p-2 bg-primary/5 hover:bg-primary/15 text-primary rounded-full transition-colors cursor-pointer" title="Send message">
                                <span class="material-symbols-outlined text-[18px]">chat</span>
                            </button>
                            <!-- Accordion Chevron Toggle -->
                            <button class="lg:hidden p-1 text-on-surface-variant hover:text-primary transition-colors">
                                <span class="accordion-chevron material-symbols-outlined text-[20px]">expand_more</span>
                            </button>
                        </div>
                    </div>
                </td>
                
                <!-- Goal Field (Collapsible) -->
                <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 text-left mt-2 lg:mt-0">
                    <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Goal</span>
                    <span class="bg-[#e5eeff] text-[#006a61] px-2.5 py-0.5 rounded text-[10px] font-bold">${cli.goal}</span>
                </td>
                
                <!-- Last Check-In Field (Collapsible) -->
                <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 text-on-surface-variant text-right lg:text-left">
                    <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Last Check-In</span>
                    <span class="font-semibold text-on-background lg:text-on-surface-variant lg:font-normal">${cli.lastCheckIn}</span>
                </td>
                
                <!-- Compliance Field (Collapsible) -->
                <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 text-left">
                    <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Compliance</span>
                    <div class="flex items-center gap-2 font-bold">
                        <div class="w-16 bg-surface-variant h-1.5 rounded-full overflow-hidden">
                            <div class="bg-primary h-full" style="width: ${cli.compliance}%"></div>
                        </div>
                        <span class="text-xs lg:text-[11px]">${cli.compliance}%</span>
                    </div>
                </td>
                
                <!-- Weight Progress Field (Collapsible) -->
                <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 w-auto lg:w-28 text-left">
                    <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Weight Progress</span>
                    <svg class="w-20 lg:w-full h-8" viewBox="0 0 100 30">
                        <path d="${generateSparklinePath(cli.weightTrend)}" fill="none" stroke="${cli.compliance > 80 ? '#006e2f' : '#9d4300'}" stroke-width="2"></path>
                    </svg>
                </td>
                
                <!-- Actions Column (Desktop-only) -->
                <td class="hidden lg:table-cell p-0 lg:p-4 pr-0 lg:pr-6 text-right">
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="openClientIntakeModal('${cli.email}')" class="p-2 hover:bg-surface-container hover:text-primary text-on-surface-variant rounded-full transition-colors inline-block cursor-pointer" title="View/Edit Medical Intake">
                            <span class="material-symbols-outlined text-[18px]">medical_information</span>
                        </button>
                        <button onclick="openClientProgramDiscussion('${cli.activeProgramId}', '${cli.name}')" class="p-2 hover:bg-surface-container hover:text-primary text-on-surface-variant rounded-full transition-colors inline-block cursor-pointer" title="Send message">
                            <span class="material-symbols-outlined text-[18px]">chat</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const endIdx = Math.min(startIdx + pageSize, filtered.length);
    document.getElementById('admin-clients-count-label').innerText = `Showing ${startIdx + 1} to ${endIdx} of ${filtered.length} clients`;

    // Enable/disable page controls
    const prevBtn = document.getElementById('admin-pagination-prev');
    const nextBtn = document.getElementById('admin-pagination-next');
    if (prevBtn) prevBtn.disabled = (state.clientsPage === 0);
    if (nextBtn) nextBtn.disabled = (state.clientsPage >= maxPage);
}

window.changeAdminClientsPage = function(direction) {
    state.clientsPage += direction;
    renderAdminClientsList();
};

window.filterAdminClients = function() {
    state.clientsPage = 0;
    renderAdminClientsList();
};

// Simulated Chat State & Handlers
let activeChatClient = '';
const defaultChats = {
    'Sarah Jenkins': [
        { sender: 'client', text: 'Hi doc, I have been feeling a bit bloated after Wednesday\'s afternoon snack.' },
        { sender: 'doctor', text: 'Understood Sarah, let\'s discuss adjusting your complex carb portion sizing during our next video call!' }
    ]
};

window.handleAdminAction = function(name, action) {
    if (action === 'edit-diet') {
        state.selectedMealBuilderClient = name;
        document.getElementById('meal-builder-client-select').value = name;
        navigateTo('admin-meal-builder');
        showToast(`Loaded meal builder for ${name}`, 'info');
    } else if (action === 'chat') {
        openAdminChatModal(name);
    }
};

window.openClientProgramDiscussion = function(programId, clientName) {
    if (!programId || programId === 'prog_placeholder') {
        showToast('This client is not currently assigned to any active program.', 'info');
        return;
    }
    // Navigate to Programs tab
    navigateTo('admin-meal-builder');
    // Open Discussion for this program
    window.openProgramDiscussion(programId, clientName);
};

window.openAdminChatModal = function(name) {
    activeChatClient = name;
    document.getElementById('chat-client-name').innerText = name;
    
    const clientObj = state.clients.find(c => c.name === name);
    const avatarEl = document.getElementById('chat-client-avatar');
    if (avatarEl) {
        if (clientObj && clientObj.avatar && clientObj.avatar.startsWith('http')) {
            avatarEl.innerHTML = `<img class="w-full h-full object-cover rounded-full" src="${clientObj.avatar}">`;
        } else {
            avatarEl.innerText = name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
    }
    
    // Sync with global program chats
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;
    
    const progId = clientObj?.activeProgramId || 'prog-sarah';
    const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
    const chatKey = `${progId}_${name}`;
    let chatEntry = allProgramChats.find(c => c.id === chatKey);
    
    if (!chatEntry) {
        chatEntry = {
            id: chatKey,
            programId: progId,
            clientName: name,
            chatHistory: [
                {
                    sender: 'doctor',
                    senderName: 'Dr. Hasan',
                    text: `Welcome to your customized nutrition program. Feel free to ask me any questions or request adjustments directly in this private chat thread!`,
                    time: '10:00 AM'
                }
            ]
        };
        allProgramChats.push(chatEntry);
        localStorage.setItem('nutriflow_program_chats', JSON.stringify(allProgramChats));
    }
    
    chatContainer.innerHTML = chatEntry.chatHistory.map(msg => {
        const isClient = msg.sender === 'client';
        const bubbleBg = isClient ? 'bg-surface-variant text-on-surface' : 'bg-primary text-white';
        const align = isClient ? 'items-start' : 'items-end';
        
        let attachmentHtml = '';
        if (msg.type === 'ai_food_scan' && msg.scanData) {
            const sd = msg.scanData;
            attachmentHtml = `
                <div class="mt-2 rounded-xl overflow-hidden border border-outline-variant/30 shadow-md bg-surface text-slate-800 w-[240px] max-w-full flex flex-col font-sans text-left">
                    <div class="relative h-32 bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img src="${sd.imageUrl}" class="w-full h-full object-cover">
                        <div class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm border border-white/10">
                            <span class="material-symbols-outlined text-[12px] text-primary">auto_awesome</span> AI Verified
                        </div>
                    </div>
                    <div class="p-3">
                        <h4 class="font-black text-sm text-on-surface truncate leading-tight">${sd.foodName}</h4>
                        <div class="flex items-baseline gap-1 mt-0.5 mb-2">
                            <span class="text-lg font-black text-primary leading-none">${sd.calories}</span>
                            <span class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">kcal</span>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-1.5 mb-3">
                            <div class="bg-surface-container-low rounded-lg p-1.5 text-center border border-outline-variant/20">
                                <div class="text-[9px] font-black text-slate-500 uppercase tracking-wide">Pro</div>
                                <div class="text-[11px] font-bold text-slate-700">${sd.protein}g</div>
                            </div>
                            <div class="bg-surface-container-low rounded-lg p-1.5 text-center border border-outline-variant/20">
                                <div class="text-[9px] font-black text-slate-500 uppercase tracking-wide">Carb</div>
                                <div class="text-[11px] font-bold text-slate-700">${sd.carbs}g</div>
                            </div>
                            <div class="bg-surface-container-low rounded-lg p-1.5 text-center border border-outline-variant/20">
                                <div class="text-[9px] font-black text-slate-500 uppercase tracking-wide">Fat</div>
                                <div class="text-[11px] font-bold text-slate-700">${sd.fat}g</div>
                            </div>
                        </div>
                        
                        <button onclick="approveAndAddToDiary('${sd.foodName}', ${sd.calories}, ${sd.protein}, ${sd.carbs}, ${sd.fat})" class="w-full bg-primary hover:bg-[#005321] text-white text-[11px] font-bold py-2 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5">
                            <span class="material-symbols-outlined text-[14px]">add_circle</span>
                            Add to Meal Plan
                        </button>
                    </div>
                </div>
            `;
        }
        
        const messageText = msg.text ? `<div class="px-3.5 py-2.5 rounded-2xl max-w-[80%] text-xs font-semibold ${bubbleBg} shadow-sm">${msg.text}</div>` : '';

        return `
            <div class="flex flex-col ${align} w-full mt-2">
                <div class="text-[9px] text-slate-400 mb-1 mx-1 font-semibold">${msg.time || ''}</div>
                ${messageText}
                ${attachmentHtml}
            </div>
        `;
    }).join('');
    
    setTimeout(() => { chatContainer.scrollTop = chatContainer.scrollHeight; }, 50);

    const modal = document.getElementById('admin-chat-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeAdminChatModal = function() {
    const modal = document.getElementById('admin-chat-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

window.handleSendAdminChatMessage = function(e) {
    e.preventDefault();
    const input = document.getElementById('admin-chat-input');
    if (!input || !input.value.trim()) return;

    const messageText = input.value.trim();
    input.value = '';
    
    const clientObj = state.clients.find(c => c.name === activeChatClient);
    const progId = clientObj?.activeProgramId || 'prog-sarah';
    const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
    const chatKey = `${progId}_${activeChatClient}`;
    let chatEntry = allProgramChats.find(c => c.id === chatKey);
    
    if (chatEntry) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chatEntry.chatHistory.push({
            sender: 'doctor',
            senderName: localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan',
            text: messageText,
            time: timeNow
        });
        localStorage.setItem('nutriflow_program_chats', JSON.stringify(allProgramChats));
        
        // Re-render
        if (typeof openAdminChatModal === 'function') openAdminChatModal(activeChatClient);
        if (typeof renderAdminProgramChat === 'function') renderAdminProgramChat();
    }
};

window.showAddNewClientModal = function() {
    document.getElementById('add-client-modal').classList.remove('hidden');
    document.getElementById('add-client-modal').classList.add('flex');
};

window.closeAddNewClientModal = function() {
    document.getElementById('add-client-modal').classList.add('hidden');
    document.getElementById('add-client-modal').classList.remove('flex');
};

window.handleAddNewClientSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('new-client-name').value;
    const email = document.getElementById('new-client-email').value;
    const goal = document.getElementById('new-client-goal').value;
    const allergiesRaw = document.getElementById('new-client-allergies')?.value || '';
    const conditionsRaw = document.getElementById('new-client-conditions')?.value || '';
    
    const allergies = allergiesRaw ? allergiesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const conditions = conditionsRaw ? conditionsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const activeSpecialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    state.clients.push({
        name: name,
        email: email,
        goal: goal,
        lastCheckIn: 'Never',
        compliance: 100,
        weightTrend: [160, 160],
        avatar: initials,
        therapist: activeSpecialist,
        allergies: allergies,
        conditions: conditions,
        dietPref: 'None',
        notes: ''
    });

    saveState();
    closeAddNewClientModal();
    renderAdminClientsList();
    showToast(`Added client ${name} with medical intake data!`, 'success');
};

window.openClientIntakeModal = function(clientEmail) {
    const client = state.clients.find(c => c.email.toLowerCase() === clientEmail.toLowerCase());
    if (!client) return;

    document.getElementById('admin-intake-client-name').innerText = client.name;
    document.getElementById('admin-intake-client-email').value = client.email;

    const allergyCbs = document.querySelectorAll('input[name="admin-intake-allergies"]');
    allergyCbs.forEach(cb => {
        cb.checked = client.allergies && client.allergies.includes(cb.value);
    });

    const condCbs = document.querySelectorAll('input[name="admin-intake-conditions"]');
    condCbs.forEach(cb => {
        cb.checked = client.conditions && client.conditions.includes(cb.value);
    });

    const dietSelect = document.getElementById('admin-intake-diet');
    if (dietSelect) dietSelect.value = client.dietPref || 'None';

    const notesTa = document.getElementById('admin-intake-notes');
    if (notesTa) notesTa.value = client.notes || '';

    const modal = document.getElementById('client-intake-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeClientIntakeModal = function() {
    const modal = document.getElementById('client-intake-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.handleAdminSaveClientIntake = function(e) {
    e.preventDefault();
    const email = document.getElementById('admin-intake-client-email').value;
    const client = state.clients.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (!client) return;

    const allergyCbs = document.querySelectorAll('input[name="admin-intake-allergies"]:checked');
    client.allergies = Array.from(allergyCbs).map(cb => cb.value);

    const condCbs = document.querySelectorAll('input[name="admin-intake-conditions"]:checked');
    client.conditions = Array.from(condCbs).map(cb => cb.value);

    client.dietPref = document.getElementById('admin-intake-diet').value;
    client.notes = document.getElementById('admin-intake-notes').value;

    saveState();
    closeClientIntakeModal();
    renderAdminClientsList();
    showToast(`Updated Medical Intake for ${client.name}!`, 'success');
};

// ==================== WEEKLY MEAL BUILDER ====================
function renderAdminMealBuilder() {
    if (state.editingProgramId) {
        toggleProgramViewMode(true);
        loadMealBuilderProgramPlan();
    } else {
        toggleProgramViewMode(false);
    }
    renderLibraryList();
}

window.toggleProgramViewMode = function(editing) {
    const sidebar = document.getElementById('library-sidebar');
    const mainContent = document.getElementById('meal-builder-main-content');
    const listView = document.getElementById('programs-list-view');
    const editorView = document.getElementById('program-editor-view');
    const discView = document.getElementById('program-discussion-view');
    
    if (discView) discView.classList.add('hidden');

    if (editing) {
        if (sidebar) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex');
        }
        if (mainContent) {
            mainContent.classList.remove('lg:col-span-12');
            mainContent.classList.add('lg:col-span-9', 'order-1');
        }
        if (listView) listView.classList.add('hidden');
        if (editorView) editorView.classList.remove('hidden');
    } else {
        if (sidebar) {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('flex');
        }
        if (mainContent) {
            mainContent.classList.remove('lg:col-span-9', 'order-1');
            mainContent.classList.add('lg:col-span-12');
        }
        if (listView) listView.classList.remove('hidden');
        if (editorView) editorView.classList.add('hidden');
        
        state.editingProgramId = null;
        renderProgramsList();
    }
};

window.loadMealBuilderProgramPlan = function() {
    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    const titleEl = document.getElementById('editor-program-title');
    if (titleEl) titleEl.innerText = program.name;
    
    const descEl = document.getElementById('editor-program-description');
    if (descEl) descEl.innerText = program.description;
    
    const kcalInput = document.getElementById('target-kcal');
    if (kcalInput) kcalInput.value = program.targetKcal || 2000;
    
    renderWeeklyMealTable();
};

window.saveProgramTargetKcal = function() {
    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    const kcalVal = parseInt(document.getElementById('target-kcal').value) || 2000;
    program.targetKcal = kcalVal;
    
    saveAdminState();
    renderWeeklyTotalsSummary();
    showToast(`Target calorie for "${program.name}" updated to ${kcalVal} kcal/day`, 'success');
};

window.renderProgramsList = function() {
    const grid = document.getElementById('programs-cards-grid');
    if (!grid) return;
    
    const searchVal = (document.getElementById('programs-search')?.value || '').toLowerCase();
    const activeSpecialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    const filtered = state.programs.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
        const matchesCreator = p.creator === activeSpecialist;
        return matchesSearch && matchesCreator;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-on-surface-variant font-medium bg-white rounded-2xl border border-outline-variant/35 p-6">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">assignment_late</span>
                <p class="text-xs">No programs found. Click "+ Create Program" to build one!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(p => {
        let totalMeals = 0;
        if (p.meals) {
            Object.values(p.meals).forEach(dayMeals => {
                if (Array.isArray(dayMeals)) {
                    totalMeals += dayMeals.length;
                }
            });
        }
        
        return `
            <div class="bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[200px]">
                <div class="space-y-3">
                    <div class="flex justify-between items-start gap-4">
                        <h3 class="font-bold text-on-background text-sm leading-snug line-clamp-1">${p.name}</h3>
                        <button onclick="deleteProgram('${p.id}')" class="text-outline-variant hover:text-red-500 cursor-pointer shrink-0 mt-0.5" title="Delete Program">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                    <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-3">${p.description}</p>
                </div>
                
                <div class="border-t border-outline-variant/20 pt-4 mt-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div class="flex justify-between items-center w-full sm:w-auto">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Scheduled Meals</span>
                            <span class="text-xs font-extrabold text-primary">${totalMeals} meals</span>
                        </div>
                        <!-- share icon next to it on mobile -->
                        <div class="flex sm:hidden items-center gap-1.5">
                            <button onclick="shareProgramLink('${p.id}')" class="bg-surface hover:bg-slate-50 border border-outline-variant/40 text-on-surface-variant font-bold p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center" title="Share Program">
                                <span class="material-symbols-outlined text-[16px]">share</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button onclick="editProgramPlan('${p.id}')" class="flex-grow sm:flex-grow-0 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">edit</span> Edit Plan
                        </button>
                        
                        <!-- Desktop-only share button -->
                        <div class="hidden sm:flex items-center gap-1.5">
                            <button onclick="shareProgramLink('${p.id}')" class="bg-surface hover:bg-slate-50 border border-outline-variant/40 text-on-surface-variant font-bold p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center" title="Share Program">
                                <span class="material-symbols-outlined text-[15px]">share</span>
                            </button>
                        </div>
                        
                        <button onclick="openPublishProgramDialog('${p.id}')" class="flex-grow sm:flex-grow-0 bg-primary hover:bg-[#005321] text-white font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5">
                            <span class="material-symbols-outlined text-sm">send</span> Publish
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.editProgramPlan = function(programId) {
    state.editingProgramId = programId;
    renderAdminMealBuilder();
};

window.exitProgramEditor = function() {
    toggleProgramViewMode(false);
};

window.deleteProgram = function(programId) {
    if (confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
        state.programs = state.programs.filter(p => p.id !== programId);
        saveAdminState();
        renderProgramsList();
        showToast("Program deleted successfully.", "success");
    }
};

window.openCreateProgramModal = function() {
    const modal = document.getElementById('create-program-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    const nameInput = document.getElementById('new-prog-name');
    const descInput = document.getElementById('new-prog-description');
    if (nameInput) nameInput.value = '';
    if (descInput) {
        descInput.value = '';
        descInput.style.height = 'auto';
    }
};

window.closeCreateProgramModal = function() {
    const modal = document.getElementById('create-program-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.handleCreateProgramSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('new-prog-name').value.trim();
    const description = document.getElementById('new-prog-description').value.trim();
    const activeSpecialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    if (!name || !description) return;

    const newProgram = {
        id: 'prog-' + Date.now(),
        name: name,
        description: description,
        creator: activeSpecialist,
        targetKcal: 2000,
        meals: {
            'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': [], 'Sun': []
        }
    };
    
    state.programs.push(newProgram);
    saveAdminState();
    closeCreateProgramModal();
    
    // Automatically open the editor for this new program
    state.editingProgramId = newProgram.id;
    renderAdminMealBuilder();
    
    showToast(`Program "${name}" created successfully! Pick your meals below.`, "success");
};

window.setLibraryFilter = function(filter) {
    state.adminSelectedFoodFilter = filter;
    
    // Toggle active class on chips
    const chips = document.querySelectorAll('.library-chip');
    chips.forEach(chip => {
        const onclickAttr = chip.getAttribute('onclick') || '';
        const isActive = onclickAttr.includes(`'${filter}'`);
        if (isActive) {
            chip.className = 'library-chip active bg-primary text-white text-[9px] font-bold py-1.5 rounded-lg hover:opacity-90 transition-all text-center';
        } else {
            chip.className = 'library-chip bg-surface-container border border-outline-variant/30 text-[9px] font-bold text-on-surface-variant py-1.5 rounded-lg hover:bg-slate-100 transition-all text-center';
        }
    });
    
    renderLibraryList();
};

window.filterLibraryFoods = function() {
    renderLibraryList();
};

function renderLibraryList() {
    const container = document.getElementById('library-list-container');
    if (!container) return;
    
    const query = (document.getElementById('library-search')?.value || '').toLowerCase();
    const activeFilter = state.adminSelectedFoodFilter || 'all';
    
    const filtered = state.foodLibrary.filter(f => {
        const matchesQuery = f.title.toLowerCase().includes(query) || (f.type || '').toLowerCase().includes(query);
        const matchesFilter = activeFilter === 'all' || 
            (activeFilter === 'Recipes' && (f.type === 'Recipes' || f.type.toLowerCase().includes('recipe'))) ||
            (activeFilter === 'Raw Foods' && (f.type === 'Raw Foods' || f.type.toLowerCase().includes('raw'))) ||
            (activeFilter === 'Favorites' && f.favorite);
        return matchesQuery && matchesFilter;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-[10px] text-on-surface-variant font-medium text-center py-6">No foods found.</div>`;
        return;
    }
    
    container.innerHTML = filtered.map(f => {
        let tagHtml = '';
        if (f.id === 'f-1' || f.id === 'f-3') {
            tagHtml = `<span class="inline-block bg-[#eff6ff] text-[#1e40af] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1.5">Vegetarian</span>`;
        } else if (f.id === 'f-2' || f.id === 'f-4') {
            tagHtml = `<span class="inline-block bg-[#f0fdf4] text-[#166534] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1.5">High Protein</span>`;
        } else {
            tagHtml = `<span class="inline-block bg-[#fef3c7] text-[#92400e] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1.5">Raw Food</span>`;
        }

        return `
            <div draggable="true" ondragstart="handleLibraryDragStart(event, '${f.id}')" class="bg-white border border-outline-variant/30 rounded-2xl p-4 flex gap-3.5 items-center shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/45 transition-colors">
                <div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 select-none pointer-events-none">
                    <img class="w-full h-full object-cover" src="${f.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}" alt="${f.title}">
                </div>
                <div class="min-w-0 flex-grow text-left select-none pointer-events-none">
                    <h4 class="font-bold text-xs text-slate-800 leading-snug">${f.title}</h4>
                    <p class="text-[10px] text-slate-500 font-medium mt-0.5">${f.calories} kcal · ${f.p}g P · ${f.c}g C · ${f.f}g F</p>
                    ${tagHtml}
                </div>
            </div>
        `;
    }).join('');
}

function renderWeeklyMealTable() {
    const tbody = document.getElementById('weekly-meal-table-body');
    if (!tbody) return;
    
    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId) || {};
    const clientPlan = program.meals || {};
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rowTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    
    let html = '';
    
    rowTypes.forEach(rowType => {
        let rowHeaderHtml = '';
        if (rowType === 'Breakfast') {
            rowHeaderHtml = `
                <div class="flex flex-col items-center justify-center gap-1 py-2">
                    <span class="material-symbols-outlined text-[#006e2f] text-2xl" style="font-variation-settings: 'FILL' 1;">wb_twilight</span>
                    <span class="font-bold text-xs text-slate-700">${rowType}</span>
                </div>
            `;
        } else if (rowType === 'Lunch') {
            rowHeaderHtml = `
                <div class="flex flex-col items-center justify-center gap-1 py-2">
                    <span class="material-symbols-outlined text-[#9d4300] text-2xl" style="font-variation-settings: 'FILL' 1;">sunny</span>
                    <span class="font-bold text-xs text-slate-700">${rowType}</span>
                </div>
            `;
        } else if (rowType === 'Dinner') {
            rowHeaderHtml = `
                <div class="flex flex-col items-center justify-center gap-1 py-2">
                    <span class="material-symbols-outlined text-indigo-700 text-2xl" style="font-variation-settings: 'FILL' 1;">nights_stay</span>
                    <span class="font-bold text-xs text-slate-700">${rowType}</span>
                </div>
            `;
        } else {
            rowHeaderHtml = `
                <div class="flex flex-col items-center justify-center gap-1 py-2">
                    <span class="material-symbols-outlined text-[#006a61] text-2xl" style="font-variation-settings: 'FILL' 1;">cookie</span>
                    <span class="font-bold text-xs text-slate-700">${rowType}</span>
                </div>
            `;
        }

        html += `<tr class="hover:bg-slate-50/50 transition-colors">`;
        html += `<td class="p-3 border-r border-outline-variant/20 bg-surface-container-low/20 align-middle text-center w-[12%]">${rowHeaderHtml}</td>`;
        
        days.forEach(day => {
            const meals = (clientPlan[day] || []).filter(m => m.type.toLowerCase() === rowType.toLowerCase());
            
            html += `<td class="p-3 border-r border-outline-variant/20 align-middle relative min-h-[100px]" ondragover="handleCellDragOver(event)" ondrop="handleCellDrop(event, '${day}', '${rowType}')">`;
            
            if (meals.length === 0) {
                // Centered circular plus icon
                html += `
                    <div class="flex items-center justify-center h-16">
                        <button onclick="openAssignFoodModal('${day}', '${rowType}')" class="text-slate-300 hover:text-primary transition-colors flex items-center justify-center cursor-pointer">
                            <span class="material-symbols-outlined" style="font-size:26px;">add_circle</span>
                        </button>
                    </div>
                `;
            } else {
                html += `<div class="flex flex-col gap-2">`;
                meals.forEach(m => {
                    html += `
                        <div class="bg-white border border-outline-variant/30 rounded-xl p-3 flex flex-col gap-1 relative shadow-sm text-[11px] text-left">
                            <button onclick="removeFoodFromSlot('${day}', '${rowType}', '${m.title}')" class="absolute top-2 right-2 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shrink-0">
                                <span class="material-symbols-outlined text-[14px]">close</span>
                            </button>
                            <div class="font-bold text-slate-800 pr-4 leading-tight">${m.title}</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">${m.calories} kcal</div>

                        </div>
                    `;
                });
                // Dotted border card with plus symbol under the meals
                html += `
                    <button onclick="openAssignFoodModal('${day}', '${rowType}')" class="w-full border border-dashed border-outline-variant/40 hover:border-primary/60 hover:bg-primary/5 rounded-xl py-1.5 flex items-center justify-center text-slate-400 hover:text-primary transition-all cursor-pointer">
                        <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                `;
                html += `</div>`;
            }
            
            html += `</td>`;
        });
        
        html += `</tr>`;
    });
    
    tbody.innerHTML = html;
    
    renderWeeklyTotalsSummary();
}

window.setSelectedTotalsDay = function(day) {
    state.selectedTotalsDay = day;
    renderWeeklyTotalsSummary();
};

function renderWeeklyTotalsSummary() {
    const container = document.getElementById('weekly-totals-summary-container');
    if (!container) return;
    
    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId) || {};
    const clientPlan = program.meals || {};
    
    if (!state.selectedTotalsDay) {
        state.selectedTotalsDay = 'Mon';
    }
    const day = state.selectedTotalsDay;
    const targetKcal = parseInt(document.getElementById('target-kcal').value) || 2000;
    
    const meals = clientPlan[day] || [];
    let kcal = 0;
    let p = 0;
    let c = 0;
    let f = 0;
    
    meals.forEach(m => {
        kcal += m.calories;
        p += m.p || 0;
        c += m.c || 0;
        f += m.f || 0;
    });
    
    const pct = Math.min((kcal / targetKcal) * 100, 100);
    
    let html = `
        <div class="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 w-full">
            <!-- Left Side: Calorie Progress -->
            <div class="w-full md:w-[35%] flex flex-col gap-2">
                <div>
                    <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">${day} Totals</span>
                    <span class="text-2xl font-extrabold text-slate-800">${kcal.toLocaleString()} <span class="text-sm font-normal text-slate-500">/ ${targetKcal.toLocaleString()} kcal</span></span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-[#006e2f] h-full rounded-full transition-all" style="width: ${pct}%"></div>
                </div>
            </div>
            
            <!-- Middle: Divider -->
            <div class="hidden md:block w-px h-12 bg-slate-200"></div>
            
            <!-- Right Side: Macros Row -->
            <div class="w-full md:w-[60%] flex flex-row items-center justify-around gap-4">
                <!-- Protein Column -->
                <div class="flex gap-3 items-center">
                    <div class="w-1.5 h-8 bg-[#006e2f] rounded-full"></div>
                    <div>
                        <div class="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Protein</div>
                        <div class="text-base font-bold text-slate-800">${p}g</div>
                    </div>
                </div>
                
                <!-- Carbs Column -->
                <div class="flex gap-3 items-center">
                    <div class="w-1.5 h-8 bg-[#006e2f] rounded-full"></div>
                    <div>
                        <div class="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Carbs</div>
                        <div class="text-base font-bold text-slate-800">${c}g</div>
                    </div>
                </div>
                
                <!-- Fats Column -->
                <div class="flex gap-3 items-center">
                    <div class="w-1.5 h-8 bg-[#9d4300] rounded-full"></div>
                    <div>
                        <div class="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Fats</div>
                        <div class="text-base font-bold text-slate-800">${f}g</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Day selector hint -->
        <div class="text-[10px] text-center text-slate-400 mt-3">
            Click on a day column header (e.g. Mon, Tue) to view its daily macronutrient breakdown totals.
        </div>
    `;
    
    container.innerHTML = html;
}

window.openAssignFoodModal = function(day, mealType) {
    state.activeAssignDay = day;
    state.activeAssignMealType = mealType;
    
    document.getElementById('assign-food-day-label').innerText = day;
    document.getElementById('assign-food-type-label').innerText = mealType;
    
    const container = document.getElementById('assign-food-options-container');
    if (container) {
        container.innerHTML = state.foodLibrary.map(f => `
            <div onclick="assignFoodToSlot('${f.id}')" class="bg-surface hover:bg-primary/5 border border-outline-variant/30 rounded-xl p-3 flex gap-3 items-center cursor-pointer transition-all">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img class="w-full h-full object-cover" src="${f.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}" alt="${f.title}">
                </div>
                <div class="min-w-0 flex-grow text-left">
                    <h4 class="font-bold text-xs text-on-background truncate">${f.title}</h4>
                    <p class="text-[9px] text-on-surface-variant font-medium mt-0.5">${f.calories} kcal · P:${f.p}g • C:${f.c}g • F:${f.f}g</p>
                </div>
                <span class="material-symbols-outlined text-primary text-base">add_circle</span>
            </div>
        `).join('');
    }
    
    document.getElementById('assign-food-modal').classList.remove('hidden');
    document.getElementById('assign-food-modal').classList.add('flex');
};

window.closeAssignFoodModal = function() {
    document.getElementById('assign-food-modal').classList.add('hidden');
    document.getElementById('assign-food-modal').classList.remove('flex');
};

window.assignFoodToSlot = function(foodId) {
    const food = state.foodLibrary.find(f => f.id === foodId);
    if (!food) return;
    
    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    if (!program.meals) program.meals = {};
    const day = state.activeAssignDay;
    if (!program.meals[day]) program.meals[day] = [];
    
    program.meals[day].push({
        type: state.activeAssignMealType,
        title: food.title,
        calories: food.calories,
        p: food.p,
        c: food.c,
        f: food.f,
        image: food.image,
        recipeIngredients: food.recipeIngredients || '',
        recipeSteps: food.recipeSteps || ''
    });
    
    saveAdminState();
    closeAssignFoodModal();
    renderWeeklyMealTable();
};

window.handleLibraryDragStart = function(event, foodId) {
    event.dataTransfer.setData('text/plain', foodId);
    event.dataTransfer.effectAllowed = 'copy';
};

window.handleCellDragOver = function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
};

window.handleCellDrop = function(event, day, mealType) {
    event.preventDefault();
    const foodId = event.dataTransfer.getData('text/plain');
    if (!foodId) return;

    const food = state.foodLibrary.find(f => f.id === foodId);
    if (!food) return;

    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;

    if (!program.meals) program.meals = {};
    if (!program.meals[day]) program.meals[day] = [];

    // Overwrite slot if it exists
    program.meals[day] = program.meals[day].filter(m => m.type.toLowerCase() !== mealType.toLowerCase());

    program.meals[day].push({
        type: mealType,
        title: food.title,
        calories: food.calories,
        p: food.p,
        c: food.c,
        f: food.f,
        image: food.image,
        recipeIngredients: food.recipeIngredients || '',
        recipeSteps: food.recipeSteps || ''
    });

    saveAdminState();
    renderWeeklyMealTable();
    renderWeeklyTotalsSummary();
    showToast(`Added ${food.title} to ${day} ${mealType}!`, 'success');
};

window.openAddFoodModal = function() {
    document.getElementById('add-food-modal').classList.remove('hidden');
    document.getElementById('add-food-modal').classList.add('flex');
};

window.closeAddFoodModal = function() {
    document.getElementById('add-food-modal').classList.add('hidden');
    document.getElementById('add-food-modal').classList.remove('flex');
};

window.handleAddFoodSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('food-name').value;
    const type = document.getElementById('food-category').value;
    const calories = parseInt(document.getElementById('food-kcal').value) || 0;
    const p = parseInt(document.getElementById('food-pro').value) || 0;
    const c = parseInt(document.getElementById('food-carb').value) || 0;
    const f = parseInt(document.getElementById('food-fat').value) || 0;
    const imgUrl = document.getElementById('food-image-url').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
    const recipeIngredients = document.getElementById('food-recipe-ingredients').value.trim();
    const recipeSteps = document.getElementById('food-recipe-steps').value.trim();

    const newFood = {
        id: `f-${Date.now()}`,
        title: name,
        type: type,
        calories: calories,
        p: p,
        c: c,
        f: f,
        image: imgUrl,
        favorite: false,
        recipeIngredients: recipeIngredients,
        recipeSteps: recipeSteps
    };

    state.foodLibrary.push(newFood);
    saveAdminState();
    closeAddFoodModal();
    renderLibraryList();
    showToast(`Added ${name} to library!`, 'success');

    // Reset inputs
    document.getElementById('food-name').value = '';
    document.getElementById('food-kcal').value = '';
    document.getElementById('food-pro').value = '';
    document.getElementById('food-carb').value = '';
    document.getElementById('food-fat').value = '';
    document.getElementById('food-image-url').value = '';
    document.getElementById('food-recipe-ingredients').value = '';
    document.getElementById('food-recipe-steps').value = '';
};

window.removeFoodFromSlot = function(day, mealType, foodTitle) {
    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program || !program.meals || !program.meals[day]) return;
    
    program.meals[day] = program.meals[day].filter(
        m => !(m.type.toLowerCase() === mealType.toLowerCase() && m.title === foodTitle)
    );
    
    saveAdminState();
    renderWeeklyMealTable();
};

window.publishWeeklyPlanToClient = function() {
    const client = state.selectedMealBuilderClient;
    
    // Get live meal plans or init empty object
    const livePlans = JSON.parse(localStorage.getItem('nutriflow_client_meal_plans')) || {};
    
    // Copy active client's draft meal plan to live state
    livePlans[client] = JSON.parse(JSON.stringify(state.clientMealPlans[client] || {}));
    
    // Write back live plans to nutriflow_client_meal_plans
    localStorage.setItem('nutriflow_client_meal_plans', JSON.stringify(livePlans));
    
    saveAdminState();
    showToast(`Weekly meal plan for ${client} published successfully!`, 'success');
};

window.saveWeeklyTemplate = function() {
    showToast(`Weekly meal template saved successfully!`, 'success');
};

window.previewWeeklyPlan = function() {
    const client = state.selectedMealBuilderClient;
    const origin = window.location.origin;
    let clientUrl = origin;
    if (clientUrl.endsWith('/admin') || clientUrl.endsWith('/admin/')) {
        clientUrl = clientUrl.replace(/\/admin\/?$/, '');
    }
    const previewUrl = `${clientUrl}/dashboard.html?client=${encodeURIComponent(client)}&preview=true`;
    
    saveAdminState();
    window.open(previewUrl, '_blank');
};

// ==================== APPOINTMENTS TABLE ====================
state.appointmentFilter = 'all';

window.setAppointmentsFilter = function(filter) {
    state.appointmentFilter = filter;
    
    // Sync select dropdown if changed programmatically
    const select = document.getElementById('appointments-filter-status');
    if (select && select.value !== filter) {
        select.value = filter;
    }

    renderAdminAppointmentsTable();
};

window.renderAdminAppointmentsTable = function() {
    loadAdminState(); // sync fresh appointments from LocalStorage
    
    const tbody = document.getElementById('appointments-table-body');
    const footer = document.getElementById('appointments-table-footer');
    if (!tbody) return;

    const searchTerm = (document.getElementById('appointments-search')?.value || '').toLowerCase();
    
    let filtered = state.appointments.filter(apt => {
        const matchSearch = apt.clientName.toLowerCase().includes(searchTerm) || apt.serviceTitle.toLowerCase().includes(searchTerm);
        
        let matchFilter = true;
        if (state.appointmentFilter !== 'all') {
            matchFilter = apt.status === state.appointmentFilter;
        }
        
        return matchSearch && matchFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">No reservations found.</td></tr>`;
        if (footer) footer.innerText = 'Showing 0 reservations';
        return;
    }

    const getStatusStyle = (status) => {
        if (status === 'approved' || status === 'confirmed' || status === 'completed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (status === 'cancelled') return 'bg-gray-100 text-gray-800 border-gray-200';
        return 'bg-surface-container-high text-on-surface border-outline-variant/30';
    };

    const getStatusText = (status) => {
        if (status === 'approved') return 'Confirmed';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    tbody.innerHTML = filtered.map(apt => `
        <tr class="flex flex-col lg:table-row bg-surface-container-lowest border border-outline-variant/30 lg:border-0 rounded-2xl p-4 lg:p-0 gap-3 mb-4 lg:mb-0 hover:bg-surface-container-low/30 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] lg:shadow-none">
            <!-- Patient Header (Mobile Card Header - Click to Expand) -->
            <td onclick="toggleMobileAccordion(this.closest('tr'))" class="cursor-pointer lg:cursor-default flex justify-between items-center lg:table-cell p-0 lg:p-4 pl-0 lg:pl-6 text-left border-b border-outline-variant/15 lg:border-0 pb-3 lg:pb-4">
                <div class="flex justify-between items-start w-full">
                    <div class="text-left">
                        <div class="font-bold text-on-background text-sm lg:text-xs">${apt.clientName}</div>
                        <div class="text-[10px] font-mono text-on-surface-variant/80 mt-0.5">#${apt.id.toUpperCase()}</div>
                        <div class="mt-1">
                            ${apt.paymentStatus === 'paid' ? `<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px]">verified</span> Paid ($${apt.price})</span>` : `<span class="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Unpaid / Pending</span>`}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <!-- Status Badge on Mobile -->
                        <span class="lg:hidden px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(apt.status)}">
                            ${getStatusText(apt.status)}
                        </span>
                        <!-- Accordion Chevron Toggle -->
                        <button class="lg:hidden p-1 text-on-surface-variant hover:text-primary transition-colors">
                            <span class="accordion-chevron material-symbols-outlined text-[20px]">expand_more</span>
                        </button>
                    </div>
                </div>
            </td>
            
            <!-- Hidden ID Column for mobile (shown in Header) -->
            <td class="hidden lg:table-cell px-6 py-4 font-mono text-[10px] text-on-surface-variant">#${apt.id.toUpperCase()}</td>
            
            <!-- Service Field (Collapsible) -->
            <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 text-left mt-2 lg:mt-0">
                <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Service</span>
                <span class="font-semibold text-on-background lg:text-on-surface-variant lg:font-normal text-xs lg:text-[11px]">${apt.serviceTitle}</span>
            </td>
            
            <!-- Therapist Field (Collapsible) -->
            <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 text-left">
                <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Therapist</span>
                <span class="font-semibold text-on-background lg:text-on-surface-variant lg:font-normal text-xs lg:text-[11px]">${apt.therapist || 'Unknown'}</span>
            </td>
            
            <!-- Date & Time Field (Collapsible) -->
            <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 text-on-surface-variant text-right lg:text-left">
                <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Date & Time</span>
                <span class="font-semibold text-on-background lg:text-on-surface-variant lg:font-normal text-xs lg:text-[11px]">${apt.date} • ${apt.time}</span>
            </td>
            
            <!-- Duration Field (Collapsible) -->
            <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 text-left">
                <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Duration</span>
                <span class="font-semibold text-on-background lg:text-on-surface-variant lg:font-normal text-xs lg:text-[11px]">${apt.duration}</span>
            </td>
            
            <!-- Status Column (Desktop-only, shown in Header on mobile) -->
            <td class="hidden lg:table-cell p-0 lg:p-4 text-center">
                <span class="px-2.5 py-1 rounded-full text-[9px] font-bold border ${getStatusStyle(apt.status)}">
                    ${getStatusText(apt.status)}
                </span>
            </td>
            
            <!-- Actions Column (Collapsible) -->
            <td class="accordion-content hidden lg:table-cell flex justify-between items-center p-0 lg:p-4 pr-0 lg:pr-6 text-right">
                <span class="lg:hidden text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/75">Actions</span>
                <div class="flex items-center justify-end gap-1">
                    ${apt.status === 'pending' ? `
                        <button onclick="event.stopPropagation(); approveAppointment('${apt.id}')" class="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors cursor-pointer" title="Approve">
                            <span class="material-symbols-outlined text-[16px]">check_circle</span>
                        </button>
                        <button onclick="event.stopPropagation(); declineAppointment('${apt.id}')" class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer" title="Decline">
                            <span class="material-symbols-outlined text-[16px]">cancel</span>
                        </button>
                    ` : `
                        ${(apt.type === 'Video Call' || apt.type.toLowerCase().includes('virtual') || apt.type.toLowerCase().includes('video')) && apt.status === 'approved' ? `
                            <button onclick="event.stopPropagation(); joinAdminVideoCall('${apt.id}')" class="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Join Video Call">
                                <span class="material-symbols-outlined text-[16px]">videocam</span>
                            </button>
                        ` : ''}
                        <button onclick="event.stopPropagation(); editAppointment('${apt.id}')" class="text-on-surface-variant hover:text-primary hover:bg-surface-container p-1.5 rounded-lg transition-colors cursor-pointer" title="Edit">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onclick="event.stopPropagation(); deleteAppointment('${apt.id}')" class="text-on-surface-variant hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer" title="Delete">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    `}
                </div>
            </td>
        </tr>
    `).join('');

    if (footer) footer.innerText = `Showing ${filtered.length} reservation${filtered.length !== 1 ? 's' : ''}`;
};

window.approveAppointment = function(id) {
    const apt = state.appointments.find(a => a.id === id);
    if (apt) {
        apt.status = 'approved';
        saveAdminState();
        showToast(`Approved session for ${apt.clientName}!`, 'success');
        renderAdminAppointmentsTable();
    }
};

window.declineAppointment = function(id) {
    state.appointments = state.appointments.filter(a => a.id !== id);
    saveAdminState();
    showToast('Declined request.');
    renderAdminAppointmentsTable();
};

window.editAppointment = function(id) {
    showToast('Edit appointment functionality not available in this prototype.', 'info');
};

window.deleteAppointment = function(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        state.appointments = state.appointments.filter(a => a.id !== id);
        saveAdminState();
        showToast('Appointment deleted.', 'success');
        renderAdminAppointmentsTable();
    }
};

window.joinAdminVideoCall = function(aptId) {
    const apt = state.appointments.find(a => a.id === aptId);
    if (!apt) return;
    
    showToast(`Connecting to video call with client ${apt.clientName}...`, 'success');
    setTimeout(() => {
        window.location.href = `../telehealth.html?practitioner=${encodeURIComponent(apt.therapist)}&role=admin&client=${encodeURIComponent(apt.clientName)}`;
    }, 850);
};

window.filterFoodCategory = function(cat) {
    state.adminSelectedFoodFilter = cat;
    
    document.querySelectorAll('.food-cat-btn').forEach(btn => {
        btn.className = 'food-cat-btn bg-surface-container-low text-on-surface-variant text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-surface-variant';
    });
    
    if (event && event.target) {
        event.target.className = 'food-cat-btn bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap';
    }
    
    renderAdminMealBuilder();
};

window.filterFoodLibrary = function() {
    renderAdminMealBuilder();
};

window.openEditCommentModal = function(day, mealType, mealTitle, currentCommentEncoded) {
    state.activeCommentDay = day;
    state.activeCommentMealType = mealType;
    state.activeCommentMealTitle = mealTitle;

    let currentComment = '';
    if (currentCommentEncoded) {
        try {
            currentComment = decodeURIComponent(currentCommentEncoded);
        } catch (e) {
            currentComment = currentCommentEncoded;
        }
    }

    const titleEl = document.getElementById('comment-modal-meal-title');
    if (titleEl) {
        titleEl.innerText = `${day} · ${mealType} · ${mealTitle}`;
    }
    const txtArea = document.getElementById('comment-textarea');
    if (txtArea) {
        txtArea.value = currentComment;
    }

    const modal = document.getElementById('edit-comment-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeEditCommentModal = function() {
    const modal = document.getElementById('edit-comment-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.saveMealComment = function() {
    const day = state.activeCommentDay;
    const mealType = state.activeCommentMealType;
    const mealTitle = state.activeCommentMealTitle;
    const commentVal = document.getElementById('comment-textarea').value.trim();

    const progId = state.editingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (program && program.meals && program.meals[day]) {
        const meal = program.meals[day].find(
            m => m.type.toLowerCase() === mealType.toLowerCase() && m.title === mealTitle
        );
        if (meal) {
            meal.comment = commentVal;
            saveAdminState();
            renderWeeklyMealTable();
            showToast('Comment updated successfully!', 'success');
        }
    }
    closeEditCommentModal();
};

window.shareProgramLink = function(programId) {
    shareProgramLinkLogic(programId);
};

window.shareProgramDirect = function() {
    const progId = state.editingProgramId;
    if (progId) {
        shareProgramLinkLogic(progId);
    }
};

function shareProgramLinkLogic(programId) {
    const program = state.programs.find(p => p.id === programId);
    if (!program) return;
    
    state.sharingProgramId = programId;
    const specialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    const origin = window.location.origin;
    let clientUrl = origin;
    if (clientUrl.endsWith('/admin') || clientUrl.endsWith('/admin/')) {
        clientUrl = clientUrl.replace(/\/admin\/?$/, '');
    }
    const previewUrl = `${clientUrl}/dashboard.html?programId=${programId}&preview=true`;
    
    const urlInput = document.getElementById('share-preview-url-input');
    if (urlInput) urlInput.value = previewUrl;
    
    const subjectEl = document.getElementById('share-email-subject');
    if (subjectEl) subjectEl.innerText = `Your Personalized Program "${program.name}" from ${specialist}`;
    
    const salutationEl = document.getElementById('share-email-body-salutation');
    if (salutationEl) salutationEl.innerText = `Hi,`;
    
    const doctorNameEl = document.getElementById('share-email-doctor-name');
    if (doctorNameEl) doctorNameEl.innerText = specialist;
    
    const recipientsInput = document.getElementById('share-email-recipients');
    if (recipientsInput) recipientsInput.value = '';
    
    draftedRecipients = [];
    renderDraftedRecipients();
    
    const modal = document.getElementById('share-preview-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

window.closeSharePreviewModal = function() {
    const modal = document.getElementById('share-preview-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.copySharePreviewLink = function() {
    const urlInput = document.getElementById('share-preview-url-input');
    if (urlInput) {
        urlInput.select();
        navigator.clipboard.writeText(urlInput.value).then(() => {
            showToast('Preview link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy link. Please select and copy manually.', 'error');
        });
    }
};

window.copyInvitationEmailText = function() {
    const progId = state.sharingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    const specialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    const previewUrl = document.getElementById('share-preview-url-input')?.value || '';
    
    const emailBody = `Subject: Your Personalized Program "${program.name}" from ${specialist}

Hi,

I have prepared your custom nutrition program "${program.name}" to help you hit your daily health goals:
${program.description}

You can view your custom weekly plan directly on our client portal without needing to register first:
${previewUrl}

After reviewing the menu, simply click the "Register" button to start logging your meals and message me directly.

Best regards,
${specialist}`;

    navigator.clipboard.writeText(emailBody).then(() => {
        showToast('Email body copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy email body.', 'error');
    });
};

window.sendPreviewEmails = function() {
    if (draftedRecipients.length === 0) {
        showToast('Please add at least one recipient email address first.', 'error');
        return;
    }
    
    const progId = state.sharingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    showToast(`Program "${program.name}" successfully sent to: ${draftedRecipients.join(', ')}!`, 'success');
    closeSharePreviewModal();
};

window.addRecipientEmail = function() {
    const input = document.getElementById('share-email-recipients');
    if (!input) return;
    const email = input.value.trim();
    if (!email) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }
    
    if (draftedRecipients.includes(email)) {
        showToast('This email is already in the list.', 'info');
        return;
    }
    
    draftedRecipients.push(email);
    input.value = '';
    renderDraftedRecipients();
};

function renderDraftedRecipients() {
    const container = document.getElementById('drafted-emails-container');
    if (!container) return;
    
    container.innerHTML = draftedRecipients.map((email, idx) => `
        <span class="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20">
            ${email}
            <button onclick="removeRecipientEmail(${idx})" type="button" class="text-primary hover:text-[#ba1a1a] font-bold shrink-0 flex items-center justify-center cursor-pointer ml-1">
                <span class="material-symbols-outlined text-[11px]">close</span>
            </button>
        </span>
    `).join('');
}

window.removeRecipientEmail = function(idx) {
    draftedRecipients.splice(idx, 1);
    renderDraftedRecipients();
};

window.openPublishProgramDialog = function(programId) {
    openPublishProgramDialogLogic(programId);
};

window.publishProgramDirect = function() {
    const progId = state.editingProgramId;
    if (progId) {
        openPublishProgramDialogLogic(progId);
    }
};

function openPublishProgramDialogLogic(programId) {
    const program = state.programs.find(p => p.id === programId);
    if (!program) return;
    
    state.publishingProgramId = programId;
    
    const container = document.getElementById('publish-target-clients-container');
    if (container) {
        const activeSpecialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
        const myClients = state.clients.filter(c => c.therapist === activeSpecialist);
        const listToUse = myClients.length > 0 ? myClients : state.clients;
        
        container.innerHTML = listToUse.map(c => {
            const isChecked = c.activeProgramId === programId ? 'checked' : '';
            return `
                <label class="flex items-center gap-3 text-xs text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer transition-all">
                    <input type="checkbox" name="publish-client-checkbox" value="${c.name}" ${isChecked} class="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300">
                    <span class="font-medium">${c.name}</span>
                </label>
            `;
        }).join('');
    }
    
    const modal = document.getElementById('publish-program-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

window.closePublishProgramModal = function() {
    const modal = document.getElementById('publish-program-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.handlePublishProgramSubmit = function(e) {
    e.preventDefault();
    const checkedBoxes = document.querySelectorAll('input[name="publish-client-checkbox"]:checked');
    const selectedClientNames = Array.from(checkedBoxes).map(box => box.value);
    
    if (selectedClientNames.length === 0) {
        showToast('Please select at least one client to publish the program to.', 'error');
        return;
    }
    
    const progId = state.publishingProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    const livePlans = JSON.parse(localStorage.getItem('nutriflow_client_meal_plans')) || {};
    const draftPlans = JSON.parse(localStorage.getItem('nutriflow_client_meal_plans_draft')) || {};
    
    selectedClientNames.forEach(clientName => {
        const client = state.clients.find(c => c.name === clientName);
        if (client) {
            client.activeProgramId = progId;
            livePlans[clientName] = JSON.parse(JSON.stringify(program.meals || {}));
            draftPlans[clientName] = JSON.parse(JSON.stringify(program.meals || {}));
        }
    });
    
    localStorage.setItem('nutriflow_client_meal_plans', JSON.stringify(livePlans));
    localStorage.setItem('nutriflow_client_meal_plans_draft', JSON.stringify(draftPlans));
    
    saveAdminState();
    closePublishProgramModal();
    showToast(`Program "${program.name}" successfully published to: ${selectedClientNames.join(', ')}!`, 'success');
    
    renderProgramsList();
};

window.previewWeeklyPlan = function() {
    const progId = state.editingProgramId;
    const origin = window.location.origin;
    let clientUrl = origin;
    if (clientUrl.endsWith('/admin') || clientUrl.endsWith('/admin/')) {
        clientUrl = clientUrl.replace(/\/admin\/?$/, '');
    }
    const previewUrl = `${clientUrl}/dashboard.html?programId=${progId}&preview=true`;
    
    saveAdminState();
    window.open(previewUrl, '_blank');
};

window.openProgramDiscussionDirect = function() {
    state.chatParentView = 'program-editor-view';
    const progId = state.editingProgramId;
    if (progId) {
        window.openProgramDiscussion(progId);
    }
};

window.openProgramDiscussion = function(programId, targetClientName = null) {
    state.activeDiscussionProgramId = programId;
    const program = state.programs.find(p => p.id === programId);
    if (!program) return;
    
    // When opened from client list, ensure parent view is set correctly
    // so the "Back" button goes back to list if not in editor mode
    if (!state.chatParentView) {
        state.chatParentView = 'programs-list-view';
    }
    
    // Find active clients on this program
    const myClients = state.clients.filter(c => c.activeProgramId === programId);
    let clientNames = myClients.map(c => c.name);
    
    // Scan existing chats to add guest or historical users
    const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
    allProgramChats.forEach(chat => {
        if (chat.programId === programId && !clientNames.includes(chat.clientName)) {
            clientNames.push(chat.clientName);
        }
    });
    
    if (clientNames.length === 0) {
        clientNames = ['Guest User'];
    }
    
    // If targetClientName is provided, add them to the list if not present, and select them
    if (targetClientName) {
        if (!clientNames.includes(targetClientName)) {
            clientNames.unshift(targetClientName);
        }
        state.activeDiscussionClientName = targetClientName;
        state.chatSidebarMode = 'clients';
        state.mobileViewingThread = true;
    } else {
        state.activeDiscussionClientName = clientNames[0];
        state.chatSidebarMode = 'clients';
        state.mobileViewingThread = false;
    }
    
    // Hide editor and list views, show discussion view
    const sidebar = document.getElementById('library-sidebar');
    const mainContent = document.getElementById('meal-builder-main-content');
    const listView = document.getElementById('programs-list-view');
    const editorView = document.getElementById('program-editor-view');
    const discView = document.getElementById('program-discussion-view');
    
    if (sidebar) sidebar.classList.add('hidden');
    if (mainContent) mainContent.className = 'lg:col-span-12 flex flex-col gap-4 transition-all';
    
    if (listView) listView.classList.add('hidden');
    if (editorView) editorView.classList.add('hidden');
    if (discView) discView.classList.remove('hidden');
    
    const titleEl = document.getElementById('discussion-page-title');
    if (titleEl) {
        titleEl.innerHTML = `<span class="material-symbols-outlined text-primary text-xl">forum</span> Discussion: ${program.name}`;
    }
    
    // Hide navbars & footers for full-page view
    window.toggleDiscussionFullView(true);
    
    window.renderDiscussionSidebar();
    window.renderAdminProgramChat();
    window.updateMobileDiscussionUI();
};

window.renderDiscussionSidebar = function() {
    const titleEl = document.getElementById('sidebar-list-title');
    const navEl = document.getElementById('sidebar-header-nav');
    const listContainer = document.getElementById('discussion-page-clients-list');
    if (!listContainer || !titleEl || !navEl) return;
    
    if (state.chatSidebarMode === 'programs') {
        // Programs list mode
        navEl.innerHTML = '';
        titleEl.innerText = 'Programs';
        
        if (state.programs.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-6 text-xs text-on-surface-variant font-semibold">
                    No active programs found.
                </div>
            `;
        } else {
            listContainer.innerHTML = state.programs.map(p => {
                const isActive = p.id === state.activeDiscussionProgramId;
                const activeBg = isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700';
                const activeClientsCount = state.clients.filter(c => c.activeProgramId === p.id).length;
                return `
                    <div onclick="selectProgramForDiscussionChat('${p.id}')" class="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${activeBg}">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold text-[11px] shrink-0">
                                <span class="material-symbols-outlined text-base">assignment</span>
                            </div>
                            <div class="text-left min-w-0">
                                <p class="text-xs font-bold truncate leading-tight">${p.name}</p>
                                <p class="text-[8px] text-slate-400 mt-0.5 uppercase tracking-wider">${activeClientsCount} active client${activeClientsCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-slate-400 text-base">chevron_right</span>
                    </div>
                `;
            }).join('');
        }
    } else {
        // Clients list mode
        navEl.innerHTML = `
            <button onclick="goBackToSidebarPrograms()" class="text-primary font-bold text-[10px] flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-0 self-start p-0">
                <span class="material-symbols-outlined text-xs">arrow_back</span> Back to Programs
            </button>
        `;
        titleEl.innerText = 'Recipients';
        
        const progId = state.activeDiscussionProgramId;
        const myClients = state.clients.filter(c => c.activeProgramId === progId);
        let clientNames = myClients.map(c => c.name);
        
        const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
        allProgramChats.forEach(chat => {
            if (chat.programId === progId && !clientNames.includes(chat.clientName)) {
                clientNames.push(chat.clientName);
            }
        });
        if (clientNames.length === 0) clientNames = ['Guest User'];
        
        listContainer.innerHTML = clientNames.map(name => {
            const isActive = name === state.activeDiscussionClientName;
            const activeBg = isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700';
            const initials = name.split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase();
            return `
                <div onclick="selectDiscussionClient('${name}')" class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${activeBg}">
                    <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold text-[11px] shrink-0">${initials}</div>
                    <div class="flex-grow min-w-0">
                        <p class="text-xs font-bold truncate leading-tight">${name}</p>
                        <p class="text-[8px] text-slate-400 mt-0.5 uppercase tracking-wider">Client Thread</p>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.selectDiscussionClient = function(clientName) {
    state.activeDiscussionClientName = clientName;
    state.mobileViewingThread = true;
    window.renderDiscussionSidebar();
    window.renderAdminProgramChat();
    window.updateMobileDiscussionUI();
};

window.backToRecipients = function() {
    state.mobileViewingThread = false;
    window.updateMobileDiscussionUI();
};

window.updateMobileDiscussionUI = function() {
    const sidebar = document.getElementById('discussion-sidebar-panel');
    const chat = document.getElementById('discussion-chat-panel');
    const containerBox = document.getElementById('discussion-container-box');
    const mainHeader = document.getElementById('discussion-main-header');
    const gridContainer = document.getElementById('discussion-grid-container');
    if (!sidebar || !chat) return;
    
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
        if (state.mobileViewingThread) {
            sidebar.classList.add('hidden');
            chat.classList.remove('hidden');
            chat.classList.add('flex');
            
            // Hide main header to maximize chat space
            if (mainHeader) mainHeader.classList.add('hidden');
            
            // Absolute edge-to-edge fullscreen layout on mobile
            if (containerBox) {
                containerBox.className = "flex flex-col h-full w-full gap-0 p-0 border-0 shadow-none bg-surface-container-lowest overflow-hidden";
            }
            if (gridContainer) {
                gridContainer.className = "grid grid-cols-1 gap-0 h-full w-full min-h-0";
            }
            
            // Auto scroll to bottom of chat when loaded
            const chatContainer = document.getElementById('admin-page-chat-container');
            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            sidebar.classList.remove('hidden');
            chat.classList.add('hidden');
            chat.classList.remove('flex');
            
            // Show main header
            if (mainHeader) mainHeader.classList.remove('hidden');
            
            // Full width sidebar list list on mobile
            if (containerBox) {
                containerBox.className = "flex flex-col h-full w-full gap-4 p-4 border-0 shadow-none bg-surface-container-lowest overflow-hidden";
            }
            if (gridContainer) {
                gridContainer.className = "grid grid-cols-1 gap-4 h-full w-full min-h-0";
            }
        }
    } else {
        sidebar.classList.remove('hidden');
        chat.classList.remove('hidden');
        chat.classList.add('flex');
        if (mainHeader) mainHeader.classList.remove('hidden');
        
        // Full screen edge-to-edge desktop layout (no borders, no rounded corners, fills monitor)
        if (containerBox) {
            containerBox.className = "bg-surface-container-lowest rounded-none p-6 border-0 shadow-none flex flex-col gap-6 h-screen w-screen";
        }
        if (gridContainer) {
            gridContainer.className = "grid grid-cols-12 gap-6 h-[calc(100vh-120px)]";
        }
    }
};

window.addEventListener('resize', () => {
    // Only process if active view is program-discussion-view
    const discView = document.getElementById('program-discussion-view');
    if (discView && !discView.classList.contains('hidden')) {
        window.updateMobileDiscussionUI();
    }
});

window.exitProgramDiscussion = function() {
    const discView = document.getElementById('program-discussion-view');
    if (discView) discView.classList.add('hidden');
    
    // Restore navbars and footers
    window.toggleDiscussionFullView(false);
    
    const parentView = state.chatParentView || 'programs-list-view';
    state.chatParentView = null;
    
    if (parentView === 'program-editor-view') {
        const editorView = document.getElementById('program-editor-view');
        if (editorView) editorView.classList.remove('hidden');
        
        const sidebar = document.getElementById('library-sidebar');
        if (sidebar) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex');
        }
        const mainContent = document.getElementById('meal-builder-main-content');
        if (mainContent) {
            mainContent.className = 'lg:col-span-9 flex flex-col gap-4 transition-all';
        }
    } else {
        const listView = document.getElementById('programs-list-view');
        if (listView) listView.classList.remove('hidden');
        
        const sidebar = document.getElementById('library-sidebar');
        if (sidebar) sidebar.classList.add('hidden');
        
        const mainContent = document.getElementById('meal-builder-main-content');
        if (mainContent) {
            mainContent.className = 'lg:col-span-12 flex flex-col gap-4 transition-all';
        }
    }
};

window.renderAdminProgramChat = function() {
    const container = document.getElementById('admin-page-chat-container');
    const chatPanel = document.getElementById('discussion-chat-panel');
    if (!container || !chatPanel) return;
    
    if (state.chatSidebarMode === 'programs') {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center p-6 text-on-surface-variant my-auto">
                <span class="material-symbols-outlined text-5xl text-primary/30 mb-3">forum</span>
                <h4 class="text-sm font-bold text-on-background">Select a Program</h4>
                <p class="text-xs mt-1">Choose a program from the list on the left to start chatting with active clients.</p>
            </div>
        `;
        
        const input = document.getElementById('admin-page-chat-input');
        const sendBtn = chatPanel.querySelector('button[type="submit"]');
        if (input) input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        
        const label = document.getElementById('discussion-chat-with-label');
        if (label) label.innerText = 'No Active Conversation';
        
        const avatar = document.getElementById('chat-page-client-avatar');
        if (avatar) avatar.innerText = '--';
        return;
    }
    
    const input = document.getElementById('admin-page-chat-input');
    const sendBtn = chatPanel.querySelector('button[type="submit"]');
    if (input) input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    
    const progId = state.activeDiscussionProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    const activeClient = state.activeDiscussionClientName || 'Guest User';
    
    const label = document.getElementById('discussion-chat-with-label');
    if (label) {
        label.innerText = activeClient;
    }
    
    const avatar = document.getElementById('chat-page-client-avatar');
    if (avatar) {
        const clientObj = state.clients.find(c => c.name === activeClient);
        if (clientObj && clientObj.avatar && clientObj.avatar.startsWith('http')) {
            avatar.innerHTML = `<img class="w-full h-full object-cover rounded-full" src="${clientObj.avatar}">`;
        } else {
            const initials = activeClient.split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase();
            avatar.innerText = initials;
        }
    }
    
    const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
    const chatKey = `${progId}_${activeClient}`;
    let chatEntry = allProgramChats.find(c => c.id === chatKey);
    
    if (!chatEntry) {
        chatEntry = {
            id: chatKey,
            programId: progId,
            clientName: activeClient,
            chatHistory: [
                {
                    sender: 'doctor',
                    senderName: program.creator || 'Dr. Hasan',
                    text: `Welcome to your customized nutrition program "${program.name}". Feel free to ask me any questions or request adjustments directly in this private chat thread!`,
                    time: '10:00 AM'
                }
            ]
        };
    }
    
    container.innerHTML = chatEntry.chatHistory.map(msg => {
        const isDoc = msg.sender === 'doctor';
        const bubbleBg = isDoc ? 'bg-primary text-white rounded-tr-none' : 'bg-[#f1f5f9] text-slate-800 rounded-tl-none';
        const align = isDoc ? 'justify-end' : 'justify-start';
        
        let attachmentHtml = '';
        if (msg.type === 'ai_food_scan' && msg.scanData) {
            const sd = msg.scanData;
            attachmentHtml = `
                <div class="mt-2 rounded-xl overflow-hidden border border-outline-variant/30 shadow-md bg-surface text-slate-800 w-[240px] max-w-full flex flex-col font-sans">
                    <div class="relative h-32 bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img src="${sd.imageUrl}" class="w-full h-full object-cover">
                        <div class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm border border-white/10">
                            <span class="material-symbols-outlined text-[12px] text-primary">auto_awesome</span> AI Verified
                        </div>
                    </div>
                    <div class="p-3">
                        <h4 class="font-black text-sm text-on-surface truncate leading-tight">${sd.foodName}</h4>
                        <div class="flex items-baseline gap-1 mt-0.5 mb-2">
                            <span class="text-lg font-black text-primary leading-none">${sd.calories}</span>
                            <span class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">kcal</span>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-1.5 mb-3">
                            <div class="bg-surface-container-low rounded-lg p-1.5 text-center border border-outline-variant/20">
                                <div class="text-[9px] font-black text-slate-500 uppercase tracking-wide">Pro</div>
                                <div class="text-[11px] font-bold text-slate-700">${sd.protein}g</div>
                            </div>
                            <div class="bg-surface-container-low rounded-lg p-1.5 text-center border border-outline-variant/20">
                                <div class="text-[9px] font-black text-slate-500 uppercase tracking-wide">Carb</div>
                                <div class="text-[11px] font-bold text-slate-700">${sd.carbs}g</div>
                            </div>
                            <div class="bg-surface-container-low rounded-lg p-1.5 text-center border border-outline-variant/20">
                                <div class="text-[9px] font-black text-slate-500 uppercase tracking-wide">Fat</div>
                                <div class="text-[11px] font-bold text-slate-700">${sd.fat}g</div>
                            </div>
                        </div>
                        
                        <button onclick="approveAndAddToDiary('${sd.foodName}', ${sd.calories}, ${sd.protein}, ${sd.carbs}, ${sd.fat})" class="w-full bg-primary hover:bg-[#005321] text-white text-[11px] font-bold py-2 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5">
                            <span class="material-symbols-outlined text-[14px]">add_circle</span>
                            Add to Meal Plan
                        </button>
                    </div>
                </div>
            `;
        } else if (msg.file) {
            if (msg.file.type.startsWith('image/')) {
                attachmentHtml = `
                    <div class="mt-2 rounded-lg overflow-hidden max-w-full border border-outline-variant/20 shadow-sm bg-white p-1">
                        <img class="max-h-48 object-contain rounded-md" src="${msg.file.dataUrl}" alt="${msg.file.name}">
                    </div>
                `;
            } else {
                attachmentHtml = `
                    <a href="${msg.file.dataUrl}" download="${msg.file.name}" class="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-white border border-outline-variant/30 text-slate-800 hover:bg-slate-50 transition-colors w-fit max-w-full">
                        <span class="material-symbols-outlined text-primary text-xl">description</span>
                        <div class="text-left min-w-0">
                            <p class="text-xs font-bold truncate text-slate-700">${msg.file.name}</p>
                            <p class="text-[9px] text-slate-400 font-semibold">${(msg.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <span class="material-symbols-outlined text-slate-400 hover:text-primary text-base ml-2">download</span>
                    </a>
                `;
            }
        }
        
        const messageText = msg.text ? `<div>${msg.text}</div>` : '';

        return `
            <div class="flex ${align} w-full">
                <div class="${bubbleBg} text-xs px-3.5 py-2.5 rounded-2xl max-w-[85%] shadow-sm leading-relaxed">
                    <div class="flex justify-between items-baseline gap-4 mb-0.5 opacity-80 text-[8px] font-bold uppercase tracking-wider">
                        <span>${msg.senderName}</span>
                        <span>${msg.time}</span>
                    </div>
                    ${messageText}
                    ${attachmentHtml}
                </div>
            </div>
        `;
    }).join('');
    
    container.scrollTop = container.scrollHeight;
};

window.handleAdminPageChatSubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('admin-page-chat-input');
    if (!input) return;
    
    const val = input.value.trim();
    if (!val) return;
    
    const progId = state.activeDiscussionProgramId;
    const program = state.programs.find(p => p.id === progId);
    if (!program) return;
    
    const activeClient = state.activeDiscussionClientName || 'Guest User';
    
    const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
    const chatKey = `${progId}_${activeClient}`;
    let chatEntry = allProgramChats.find(c => c.id === chatKey);
    
    if (!chatEntry) {
        chatEntry = {
            id: chatKey,
            programId: progId,
            clientName: activeClient,
            chatHistory: [
                {
                    sender: 'doctor',
                    senderName: program.creator || 'Dr. Hasan',
                    text: `Welcome to your customized nutrition program "${program.name}". Feel free to ask me any questions or request adjustments directly in this private chat thread!`,
                    time: '10:00 AM'
                }
            ]
        };
        allProgramChats.push(chatEntry);
    }
    
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const specialist = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    chatEntry.chatHistory.push({
        sender: 'doctor',
        senderName: specialist,
        text: val,
        time: timeNow
    });
    
    localStorage.setItem('nutriflow_program_chats', JSON.stringify(allProgramChats));
    input.value = '';
    window.renderAdminProgramChat();
    showToast('Reply sent successfully!', 'success');
};

window.openProgramChatSelectionModal = function() {
    state.chatSidebarMode = 'programs';
    state.activeDiscussionProgramId = null;
    state.activeDiscussionClientName = null;
    state.mobileViewingThread = false;
    
    if (!state.chatParentView) {
        state.chatParentView = 'programs-list-view';
    }
    
    const sidebar = document.getElementById('library-sidebar');
    const mainContent = document.getElementById('meal-builder-main-content');
    const listView = document.getElementById('programs-list-view');
    const editorView = document.getElementById('program-editor-view');
    const discView = document.getElementById('program-discussion-view');
    
    if (sidebar) sidebar.classList.add('hidden');
    if (mainContent) mainContent.className = 'lg:col-span-12 flex flex-col gap-4 transition-all';
    
    if (listView) listView.classList.add('hidden');
    if (editorView) editorView.classList.add('hidden');
    if (discView) discView.classList.remove('hidden');
    
    const titleEl = document.getElementById('discussion-page-title');
    if (titleEl) {
        titleEl.innerHTML = `<span class="material-symbols-outlined text-primary text-xl">forum</span> Program Discussions`;
    }
    
    // Hide navbars & footers for full-page view
    window.toggleDiscussionFullView(true);
    
    window.renderDiscussionSidebar();
    window.renderAdminProgramChat();
    window.updateMobileDiscussionUI();
};

window.selectProgramForDiscussionChat = function(programId) {
    state.activeDiscussionProgramId = programId;
    state.chatSidebarMode = 'clients';
    
    const myClients = state.clients.filter(c => c.activeProgramId === programId);
    if (myClients.length > 0) {
        state.activeDiscussionClientName = myClients[0].name;
    } else {
        state.activeDiscussionClientName = 'Guest User';
    }
    
    const program = state.programs.find(p => p.id === programId);
    const titleEl = document.getElementById('discussion-page-title');
    if (titleEl && program) {
        titleEl.innerHTML = `<span class="material-symbols-outlined text-primary text-xl">forum</span> Discussion: ${program.name}`;
    }
    
    state.mobileViewingThread = false;
    
    window.renderDiscussionSidebar();
    window.renderAdminProgramChat();
    window.updateMobileDiscussionUI();
};

window.goBackToSidebarPrograms = function() {
    state.chatSidebarMode = 'programs';
    state.mobileViewingThread = false;
    
    const titleEl = document.getElementById('discussion-page-title');
    if (titleEl) {
        titleEl.innerHTML = `<span class="material-symbols-outlined text-primary text-xl">forum</span> Program Discussions`;
    }
    
    window.renderDiscussionSidebar();
    window.renderAdminProgramChat();
    window.updateMobileDiscussionUI();
};

window.toggleDiscussionFullView = function(fullViewActive) {
    const desktopNav = document.getElementById('admin-desktop-navbar');
    const mobileNav = document.getElementById('admin-mobile-navbar');
    const footer = document.getElementById('admin-page-footer');
    const mainContainer = document.getElementById('admin-main-container');
    const discView = document.getElementById('program-discussion-view');
    
    if (fullViewActive) {
        document.documentElement.classList.add('overflow-hidden');
        document.body.classList.add('overflow-hidden');
        if (desktopNav) desktopNav.classList.add('hidden');
        if (mobileNav) mobileNav.classList.add('hidden');
        if (footer) footer.classList.add('hidden');
        if (mainContainer) {
            mainContainer.className = "w-screen h-screen max-w-none p-0 m-0 relative flex flex-col flex-grow bg-surface-container-lowest overflow-hidden";
        }
        if (discView) {
            const isMobile = window.innerWidth < 1024;
            if (isMobile) {
                discView.className = "view-section flex flex-col fixed inset-0 z-40 bg-surface w-full p-0 m-0 h-[100dvh]";
            } else {
                discView.className = "view-section flex flex-col gap-4 w-full h-full";
            }
        }
    } else {
        document.documentElement.classList.remove('overflow-hidden');
        document.body.classList.remove('overflow-hidden');
        if (desktopNav) desktopNav.classList.remove('hidden');
        if (mobileNav) mobileNav.classList.remove('hidden');
        if (footer) footer.classList.remove('hidden');
        if (mainContainer) {
            mainContainer.className = "flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg relative";
        }
        if (discView) {
            discView.className = "view-section hidden flex flex-col gap-4 w-full";
        }
    }
};


// ==================== AI FOOD SCANNER LOGIC ====================
window.handleFoodScannerUpload = function(e, senderRole) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (typeof showToast === 'function') showToast('AI is scanning your food... 🔍', 'info');
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const dataUrl = event.target.result;
        
        // Simulate AI processing delay
        setTimeout(() => {
            const activeClient = localStorage.getItem('nutriflow_client_logged_name') || 'Sarah Jenkins';
            const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
            
            let progId = 'prog-sarah';
            const clientsList = JSON.parse(localStorage.getItem('nutriflow_clients')) || [];
            const clientDetails = clientsList.find(c => c.name === activeClient);
            if (clientDetails && clientDetails.activeProgramId) {
                progId = clientDetails.activeProgramId;
            }
            
            const chatKey = `${progId}_${activeClient}`;
            let chatEntry = allProgramChats.find(c => c.id === chatKey);
            if (!chatEntry) return;
            
            const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const senderName = senderRole === 'client' ? activeClient : (localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan');
            
            const aiResults = [
                { name: "Avocado Toast with Egg", cal: 320, p: 14, c: 28, f: 18 },
                { name: "Grilled Salmon Bowl", cal: 450, p: 35, c: 12, f: 28 },
                { name: "Berry Protein Smoothie", cal: 280, p: 25, c: 35, f: 5 }
            ];
            const result = aiResults[Math.floor(Math.random() * aiResults.length)];
            
            const newMessage = {
                sender: senderRole === 'client' ? 'client' : 'doctor',
                senderName: senderName,
                text: '',
                time: timeNow,
                type: 'ai_food_scan',
                scanData: {
                    imageUrl: dataUrl,
                    foodName: result.name,
                    calories: result.cal,
                    protein: result.p,
                    carbs: result.c,
                    fat: result.f
                }
            };
            
            chatEntry.chatHistory.push(newMessage);
            localStorage.setItem('nutriflow_program_chats', JSON.stringify(allProgramChats));
            
            if (typeof showToast === 'function') showToast('Scan complete!', 'success');
            
            // Re-render UI based on where we are
            if (typeof renderProgramChat === 'function') renderProgramChat();
            if (typeof renderAdminProgramChat === 'function') renderAdminProgramChat();
            
            // If admin modal chat is open, refresh it by finding the active client name in DOM
            const modalLabel = document.getElementById('chat-client-name');
            if (modalLabel && modalLabel.innerText && typeof openAdminChatModal === 'function') {
                openAdminChatModal(modalLabel.innerText);
            }
            
        }, 2000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
};

window.approveAndAddToDiary = function(foodName, calories, protein, carbs, fat) {
    const today = 'Wed';
    const activeClient = localStorage.getItem('nutriflow_client_logged_name') || 'Sarah Jenkins';
    
    // Add to Meal Plans
    const storedPlans = JSON.parse(localStorage.getItem('nutriflow_client_meal_plans')) || {};
    if (!storedPlans[activeClient]) storedPlans[activeClient] = {};
    if (!storedPlans[activeClient][today]) storedPlans[activeClient][today] = [];

    // Check if Snack already exists
    const existingSnackIndex = storedPlans[activeClient][today].findIndex(m => m.type === 'Snack');
    const newMeal = {
        id: 'ai-scan-' + Date.now(),
        type: 'Snack',
        title: foodName,
        calories: calories,
        p: protein,
        c: carbs,
        f: fat,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        time: 'Now',
        notes: 'Added via AI Scanner'
    };
    
    if (existingSnackIndex > -1) {
        // Replace or push to same array, actually meal plan is usually 1 per type in our UI, so let's replace Snack
        storedPlans[activeClient][today][existingSnackIndex] = newMeal;
    } else {
        storedPlans[activeClient][today].push(newMeal);
    }
    
    localStorage.setItem('nutriflow_client_meal_plans', JSON.stringify(storedPlans));
    
    // Auto-log it as consumed
    const loggedStatus = JSON.parse(localStorage.getItem('nutriflow_client_logged_status') || '{}');
    if (!loggedStatus[activeClient]) loggedStatus[activeClient] = {};
    if (!loggedStatus[activeClient][today]) loggedStatus[activeClient][today] = {};
    loggedStatus[activeClient][today]['Snack'] = true;
    localStorage.setItem('nutriflow_client_logged_status', JSON.stringify(loggedStatus));
    
    if (typeof showToast === 'function') showToast(foodName + ' added to food diary!', 'success');
    
    // Trigger re-renders
    if (typeof loadState === 'function') loadState();
    if (typeof renderDashboardMeals === 'function') renderDashboardMeals();
    if (typeof updateMacrosSummary === 'function') updateMacrosSummary();
    if (typeof renderAdminMealBuilder === 'function') renderAdminMealBuilder();
};

window.openFoodScannerModal = function() {
    const modal = document.getElementById('ai-food-scanner-modal');
    if (!modal) { console.error('[NutriFlow] ai-food-scanner-modal not found!'); return; }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Reset state
    const uploadArea = document.getElementById('ai-scanner-upload-area');
    const loading = document.getElementById('ai-scanner-loading');
    const result = document.getElementById('ai-scanner-result');
    if (uploadArea) { uploadArea.classList.remove('hidden'); uploadArea.classList.add('flex'); }
    if (loading) { loading.classList.add('hidden'); loading.classList.remove('flex'); }
    if (result) { result.classList.add('hidden'); result.classList.remove('flex'); }
    
    const fileInput = document.getElementById('ai-scanner-file-input');
    if (fileInput) fileInput.value = '';
};

window.closeFoodScannerModal = function() {
    const modal = document.getElementById('ai-food-scanner-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

let currentScanResult = null;

window.processFoodScan = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Hide upload area, show loading
    const uploadArea = document.getElementById('ai-scanner-upload-area');
    const loadingEl = document.getElementById('ai-scanner-loading');
    if (uploadArea) { uploadArea.classList.add('hidden'); uploadArea.classList.remove('flex'); }
    if (loadingEl) { loadingEl.classList.remove('hidden'); loadingEl.classList.add('flex'); }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const dataUrl = event.target.result;
        
        setTimeout(() => {
            // Hide loading, show result
            if (loadingEl) { loadingEl.classList.add('hidden'); loadingEl.classList.remove('flex'); }
            const resultEl = document.getElementById('ai-scanner-result');
            if (resultEl) { resultEl.classList.remove('hidden'); resultEl.classList.add('flex'); }
            
            const aiResults = [
                { name: "Avocado Toast with Egg", cal: 320, p: 14, c: 28, f: 18 },
                { name: "Grilled Salmon Bowl", cal: 450, p: 35, c: 12, f: 28 },
                { name: "Berry Protein Smoothie", cal: 280, p: 25, c: 35, f: 5 }
            ];
            const result = aiResults[Math.floor(Math.random() * aiResults.length)];
            
            currentScanResult = {
                imageUrl: dataUrl,
                foodName: result.name,
                calories: result.cal,
                protein: result.p,
                carbs: result.c,
                fat: result.f
            };
            
            document.getElementById('ai-scanner-preview-img').src = dataUrl;
            document.getElementById('ai-scanner-food-name').innerText = result.name;
            document.getElementById('ai-scanner-calories').innerText = result.cal;
            document.getElementById('ai-scanner-protein').innerText = result.p + 'g';
            document.getElementById('ai-scanner-carbs').innerText = result.c + 'g';
            document.getElementById('ai-scanner-fat').innerText = result.f + 'g';
            
            const btn = document.getElementById('ai-scanner-send-btn');
            btn.onclick = function() {
                specialistSendScanToClient();
            };
            
        }, 1500);
    };
    reader.readAsDataURL(file);
};

window.sendScanToChat = function() {
    if (!currentScanResult) return;
    
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Determine context (are we in admin or client?)
    const isAdmin = window.location.pathname.includes('/admin/');
    let senderRole = isAdmin ? 'doctor' : 'client';
    let senderName = isAdmin ? (localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan') : (localStorage.getItem('nutriflow_client_logged_name') || 'Sarah Jenkins');
    
    let activeClientName = isAdmin ? (window.activeChatClient || 'Sarah Jenkins') : (localStorage.getItem('nutriflow_client_logged_name') || 'Sarah Jenkins');
    
    const allProgramChats = JSON.parse(localStorage.getItem('nutriflow_program_chats')) || [];
    
    let progId = 'prog-sarah';
    const clientsList = JSON.parse(localStorage.getItem('nutriflow_clients')) || [];
    const clientDetails = clientsList.find(c => c.name === activeClientName);
    if (clientDetails && clientDetails.activeProgramId) {
        progId = clientDetails.activeProgramId;
    }
    
    const chatKey = `${progId}_${activeClientName}`;
    let chatEntry = allProgramChats.find(c => c.id === chatKey);
    
    if (chatEntry) {
        chatEntry.chatHistory.push({
            sender: senderRole,
            senderName: senderName,
            text: '',
            time: timeNow,
            type: 'ai_food_scan',
            scanData: currentScanResult
        });
        localStorage.setItem('nutriflow_program_chats', JSON.stringify(allProgramChats));
        
        // Refresh UI
        if (typeof renderProgramChat === 'function') renderProgramChat();
        if (typeof renderAdminProgramChat === 'function') renderAdminProgramChat();
        if (typeof openAdminChatModal === 'function' && isAdmin) openAdminChatModal(activeClientName);
    }
    
    closeFoodScannerModal();
};
// ==========================================
// FOOD SCANS HUB — Specialist Side
// ==========================================

let activeFoodChatClientId = null;

window.updateScanBadge = function() {
    const allMessages = JSON.parse(localStorage.getItem('nutriflow_food_chat_messages') || '[]');
    const unread = allMessages.filter(m => m.sender === 'client' && !m.readBySpecialist).length;
    const badge = document.getElementById('scan-badge');
    if (badge) badge.style.display = unread > 0 ? 'block' : 'none';
};

window.migrateAdminScansToChatFallback = function() {
    if (localStorage.getItem('nutriflow_food_chat_migrated')) return;
    const allScans = JSON.parse(localStorage.getItem('nutriflow_food_scans') || '[]');
    const chatMessages = JSON.parse(localStorage.getItem('nutriflow_food_chat_messages') || '[]');

    if (chatMessages.length === 0 && allScans.length > 0) {
        const sortedScans = [...allScans].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        sortedScans.forEach(scan => {
            const scanMsgId = scan.id || 'msg_' + Date.now() + '_' + Math.random();
            chatMessages.push({
                id: scanMsgId,
                clientId: scan.clientId || 'sarah_jenkins',
                clientName: scan.clientName || 'Sarah Jenkins',
                sender: scan.sender || 'client',
                senderName: scan.senderName || (scan.sender === 'client' ? scan.clientName : 'Specialist'),
                timestamp: scan.timestamp || new Date().toISOString(),
                type: 'food_scan',
                foodScan: {
                    imageUrl: scan.imageUrl,
                    foodName: scan.foodName,
                    calories: scan.calories,
                    protein: scan.protein,
                    carbs: scan.carbs,
                    fat: scan.fat,
                    addedToMeal: scan.addedToMeal || false
                }
            });

            if (scan.comments && scan.comments.length > 0) {
                scan.comments.forEach(comment => {
                    chatMessages.push({
                        id: 'msg_' + Date.now() + '_' + Math.random(),
                        clientId: scan.clientId || 'sarah_jenkins',
                        clientName: scan.clientName || 'Sarah Jenkins',
                        sender: comment.sender || 'specialist',
                        senderName: comment.sender === 'client' ? (scan.clientName || 'Sarah Jenkins') : 'Specialist',
                        timestamp: comment.timestamp || new Date().toISOString(),
                        type: 'text',
                        text: comment.text
                    });
                });
            }
        });
        localStorage.setItem('nutriflow_food_chat_messages', JSON.stringify(chatMessages));
    }
    localStorage.setItem('nutriflow_food_chat_migrated', 'true');
};

window.renderAdminScanHub = function() {
    migrateAdminScansToChatFallback();

    const clientListEl = document.getElementById('admin-food-chat-client-list');
    if (!clientListEl) return;

    const allClients = JSON.parse(localStorage.getItem('nutriflow_clients') || '[]');
    if (allClients.length === 0) {
        clientListEl.innerHTML = `
            <div class="text-center py-8 text-xs text-slate-400">
                Belum ada client aktif.
            </div>`;
        return;
    }

    if (!activeFoodChatClientId) {
        activeFoodChatClientId = allClients[0].name.toLowerCase().replace(/\s+/g, '_');
    }

    const allMessages = JSON.parse(localStorage.getItem('nutriflow_food_chat_messages') || '[]');

    // Mark messages as read for active client
    let changed = false;
    allMessages.forEach(m => {
        if (m.clientId === activeFoodChatClientId && m.sender === 'client' && !m.readBySpecialist) {
            m.readBySpecialist = true;
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('nutriflow_food_chat_messages', JSON.stringify(allMessages));
        updateScanBadge();
    }

    // Render client list on sidebar
    clientListEl.innerHTML = allClients.map(c => {
        const cId = c.name.toLowerCase().replace(/\s+/g, '_');
        const isActive = cId === activeFoodChatClientId;
        const myMessages = allMessages.filter(m => m.clientId === cId);
        
        let lastText = 'Start nutrition chat...';
        if (myMessages.length > 0) {
            const lastMsg = myMessages[myMessages.length - 1];
            lastText = lastMsg.type === 'food_scan' ? `📸 Scan: ${lastMsg.foodScan.foodName}` : lastMsg.text;
        }

        const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        return `
            <button onclick="setActiveFoodChatClient('${cId}')" class="w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${isActive ? 'bg-primary/10 text-primary font-bold border border-primary/20' : 'hover:bg-slate-100/50 text-slate-600 border border-transparent'}">
                <div class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}">
                    ${initials}
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold truncate ${isActive ? 'text-primary' : 'text-slate-800'}">${c.name}</p>
                    <p class="text-[10px] text-slate-400 truncate mt-0.5">${lastText}</p>
                </div>
            </button>`;
    }).join('');

    const activeClient = allClients.find(c => c.name.toLowerCase().replace(/\s+/g, '_') === activeFoodChatClientId) || allClients[0];
    if (activeClient) {
        const initials = activeClient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const headerAvatar = document.getElementById('admin-food-chat-header-avatar');
        const headerName = document.getElementById('admin-food-chat-header-name');

        if (headerAvatar) headerAvatar.innerText = initials;
        if (headerName) headerName.innerText = activeClient.name;

        renderAdminFoodChatMessages(activeClient);
    }
};

window.setActiveFoodChatClient = function(clientId) {
    activeFoodChatClientId = clientId;
    renderAdminScanHub();
};

window.submitAdminFoodChatMessage = function() {
    const input = document.getElementById('admin-food-chat-input');
    if (!input || !input.value.trim() || !activeFoodChatClientId) return;

    const allClients = JSON.parse(localStorage.getItem('nutriflow_clients') || '[]');
    const client = allClients.find(c => c.name.toLowerCase().replace(/\s+/g, '_') === activeFoodChatClientId);
    const clientName = client ? client.name : 'Sarah Jenkins';

    const specialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';

    const message = {
        id: 'msg_' + Date.now(),
        clientId: activeFoodChatClientId,
        clientName: clientName,
        sender: 'specialist',
        senderName: specialistName,
        timestamp: new Date().toISOString(),
        type: 'text',
        text: input.value.trim()
    };

    const allMessages = JSON.parse(localStorage.getItem('nutriflow_food_chat_messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('nutriflow_food_chat_messages', JSON.stringify(allMessages));

    input.value = '';
    renderAdminScanHub();
};

window.addScanMessageToMealPlan = function(msgId) {
    const allMessages = JSON.parse(localStorage.getItem('nutriflow_food_chat_messages') || '[]');
    const msg = allMessages.find(m => m.id === msgId);
    if (!msg || msg.type !== 'food_scan') return;

    const allPrograms = JSON.parse(localStorage.getItem('nutriflow_meal_programs') || '[]');
    const clientProgram = allPrograms.find(p => p.client === msg.clientName);
    
    if (!clientProgram) {
        showToast(`Client ${msg.clientName} tidak memiliki program aktif. Buat program terlebih dahulu di tab Builder.`, 'error');
        return;
    }

    const fs = msg.foodScan;
    const foodItem = {
        id: 'food_' + Date.now(),
        title: fs.foodName,
        calories: parseInt(fs.calories) || 300,
        p: parseInt(fs.protein) || 15,
        c: parseInt(fs.carbs) || 30,
        f: parseInt(fs.fat) || 10,
        recipeSteps: 'Add recommended meal plan steps.',
        recipeIngredients: 'Recommended food item ingredients.',
        image: fs.imageUrl || ''
    };

    if (!clientProgram.meals) clientProgram.meals = {};
    if (!clientProgram.meals['Senin']) clientProgram.meals['Senin'] = {};
    if (!clientProgram.meals['Senin']['Breakfast']) clientProgram.meals['Senin']['Breakfast'] = [];
    
    clientProgram.meals['Senin']['Breakfast'].push(foodItem);
    localStorage.setItem('nutriflow_meal_programs', JSON.stringify(allPrograms));

    msg.foodScan.addedToMeal = true;
    localStorage.setItem('nutriflow_food_chat_messages', JSON.stringify(allMessages));

    renderAdminScanHub();
    showToast(`"${fs.foodName}" ditambahkan ke Program ${msg.clientName} (Senin Breakfast)!`);
};

function renderAdminFoodChatMessages(client) {
    const container = document.getElementById('admin-food-chat-message-list');
    if (!container) return;

    const clientId = client.name.toLowerCase().replace(/\s+/g, '_');
    const allMessages = JSON.parse(localStorage.getItem('nutriflow_food_chat_messages') || '[]');
    const myMessages = allMessages.filter(m => m.clientId === clientId);

    if (myMessages.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-xs text-slate-400 m-auto flex flex-col items-center gap-2">
                <span class="material-symbols-outlined text-[32px] text-slate-300">chat_bubble_outline</span>
                Belum ada diskusi gizi dengan ${client.name}.
                <p class="text-[10px] text-slate-400">Kirim pesan pertama atau lakukan scan rekomendasi makanan untuk memulai.</p>
            </div>`;
        return;
    }

    container.innerHTML = myMessages.map(msg => {
        const isSpecialist = msg.sender === 'specialist';
        const date = new Date(msg.timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let contentHtml = '';
        if (msg.type === 'food_scan') {
            const fs = msg.foodScan;
            contentHtml = `
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:0.75rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);margin-top:0.25rem;max-width:240px;">
                    ${fs.imageUrl ? `<img src="${fs.imageUrl}" style="width:100%;height:100px;object-fit:cover;">` : ''}
                    <div style="padding:0.75rem;text-align:left;">
                        <h4 style="font-weight:800;font-size:0.75rem;color:#1e293b;margin:0 0 0.25rem;">${fs.foodName}</h4>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.375rem;">
                            <span style="font-size:0.625rem;font-weight:800;color:#14833c;">${fs.calories} kcal</span>
                            <span style="font-size:0.5625rem;color:#64748b;">P: ${fs.protein}g</span>
                            <span style="font-size:0.5625rem;color:#64748b;">C: ${fs.carbs}g</span>
                            <span style="font-size:0.5625rem;color:#64748b;">F: ${fs.fat}g</span>
                        </div>
                        ${fs.addedToMeal ? `
                            <div style="font-size:0.5625rem;background:#f0fdf4;color:#15803d;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;display:inline-flex;align-items:center;gap:0.125rem;">
                                <span class="material-symbols-outlined" style="font-size:0.625rem;">check_circle</span>Added to Program
                            </div>
                        ` : `
                            <button onclick="addScanMessageToMealPlan('${msg.id}')" style="width:100%;background:#14833c;color:#fff;font-size:0.625rem;font-weight:700;padding:0.375rem;border-radius:0.5rem;border:none;cursor:pointer;margin-top:0.25rem;transition:background 0.2s;" onmouseover="this.style.background='#005321'" onmouseout="this.style.background='#14833c'">
                                Add to Program
                            </button>
                        `}
                    </div>
                </div>`;
        } else {
            contentHtml = `<div style="font-weight:500;">${msg.text}</div>`;
        }

        return `
            <div style="display:flex;flex-direction:column;align-items:${isSpecialist ? 'flex-end' : 'flex-start'};width:100%;">
                <div style="max-width:85%;padding:0.5rem 0.75rem;border-radius:0.875rem;font-size:0.75rem;line-height:1.4;
                    background:${isSpecialist ? '#f1f5f9' : '#e0f2fe'};
                    color:${isSpecialist ? '#334155' : '#0369a1'};
                    border-bottom-right-radius:${isSpecialist ? '0.25rem' : '0.875rem'};
                    border-bottom-left-radius:${isSpecialist ? '0.875rem' : '0.25rem'};">
                    <span style="font-weight:800;font-size:0.625rem;display:block;margin-bottom:0.125rem;color:${isSpecialist ? '#475569' : '#0284c7'};">
                        ${isSpecialist ? (msg.senderName || 'Kamu (Specialist)') : 'Client'}
                    </span>
                    ${contentHtml}
                </div>
                <span style="font-size:0.5625rem;color:#94a3b8;margin-top:0.125rem;padding:0 0.25rem;">${timeStr}</span>
            </div>`;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

window.openAdminScannerModal = function() {
    const modal = document.getElementById('ai-food-scanner-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    const uploadArea = document.getElementById('ai-scanner-upload-area');
    const loading = document.getElementById('ai-scanner-loading');
    const result = document.getElementById('ai-scanner-result');
    if (uploadArea) { uploadArea.classList.remove('hidden'); uploadArea.classList.add('flex'); }
    if (loading) { loading.classList.add('hidden'); loading.classList.remove('flex'); }
    if (result) { result.classList.add('hidden'); result.classList.remove('flex'); }
    
    const fileInput = document.getElementById('ai-scanner-file-input');
    if (fileInput) fileInput.value = '';
    
    window._scannerMode = 'specialist';

    // Populate Client Selector Dropdown & pre-select active client
    const select = document.getElementById('scanner-client-select');
    if (select) {
        const allClients = JSON.parse(localStorage.getItem('nutriflow_clients') || '[]');
        if (allClients.length === 0) {
            select.innerHTML = `<option value="sarah_jenkins">Sarah Jenkins (Default)</option>`;
        } else {
            select.innerHTML = allClients.map(c => `<option value="${c.name.toLowerCase().replace(/\s+/g, '_')}">${c.name}</option>`).join('');
        }
        if (activeFoodChatClientId) {
            select.value = activeFoodChatClientId;
        }
    }
};

window.specialistSendScanToClient = function() {
    if (!currentScanResult) return;

    const select = document.getElementById('scanner-client-select');
    let clientId = 'sarah_jenkins';
    let clientName = 'Sarah Jenkins';

    if (select) {
        const allClients = JSON.parse(localStorage.getItem('nutriflow_clients') || '[]');
        const selectedId = select.value;
        const matched = allClients.find(c => c.name.toLowerCase().replace(/\s+/g, '_') === selectedId);
        if (matched) {
            clientId = selectedId;
            clientName = matched.name;
        } else if (allClients.length > 0) {
            clientId = allClients[0].name.toLowerCase().replace(/\s+/g, '_');
            clientName = allClients[0].name;
        }
    }

    const specialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';

    const message = {
        id: 'msg_' + Date.now(),
        clientId: clientId,
        clientName: clientName,
        sender: 'specialist',
        senderName: specialistName,
        timestamp: new Date().toISOString(),
        type: 'food_scan',
        foodScan: {
            imageUrl: currentScanResult.imageUrl,
            foodName: currentScanResult.foodName,
            calories: currentScanResult.calories,
            protein: currentScanResult.protein,
            carbs: currentScanResult.carbs,
            fat: currentScanResult.fat,
            addedToMeal: false
        }
    };

    const allMessages = JSON.parse(localStorage.getItem('nutriflow_food_chat_messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('nutriflow_food_chat_messages', JSON.stringify(allMessages));

    closeFoodScannerModal();
    window._scannerMode = null;
    
    // Set this client as active
    activeFoodChatClientId = clientId;
    renderAdminScanHub();

    if (typeof showToast === 'function') showToast(`Scan "${message.foodScan.foodName}" dikirim ke ${clientName}!`);
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateScanBadge, 500);
});
