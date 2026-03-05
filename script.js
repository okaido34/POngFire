// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Shuffle Matches Functionality
function shuffleMatches() {
    const input = document.getElementById('player-input').value.trim();
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const resultsContainer = document.getElementById('results-container');
    const matchesList = document.getElementById('matches-list');
    const shuffleBtn = document.getElementById('shuffle-btn');

    // Parse players
    let players = input.split('\n').map(name => name.trim()).filter(name => name.length > 0);
    
    if (players.length < 2) {
        alert('Por favor, insira pelo menos 2 jogadores!');
        return;
    }

    // Disable button during shuffle
    shuffleBtn.disabled = true;
    shuffleBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Hide previous results
    resultsContainer.classList.add('hidden');
    
    // Show progress
    progressContainer.classList.remove('hidden');
    
    // Animate progress bar
    let progress = 0;
    const duration = 3000; // 3 seconds
    const interval = 30; // Update every 30ms
    const steps = duration / interval;
    const increment = 100 / steps;
    
    const progressInterval = setInterval(() => {
        progress += increment;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Shuffle players (Fisher-Yates algorithm)
            for (let i = players.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [players[i], players[j]] = [players[j], players[i]];
            }
            
            // Create pairs
            const matches = [];
            for (let i = 0; i < players.length; i += 2) {
                if (i + 1 < players.length) {
                    matches.push({
                        player1: players[i],
                        player2: players[i + 1]
                    });
                } else {
                    matches.push({
                        player1: players[i],
                        player2: 'Aguardando adversário',
                        waiting: true
                    });
                }
            }
            
            // Display results
            displayMatches(matches);
            
            // Hide progress, show results
            setTimeout(() => {
                progressContainer.classList.add('hidden');
                resultsContainer.classList.remove('hidden');
                progressBar.style.width = '0%';
                
                // Re-enable button
                shuffleBtn.disabled = false;
                shuffleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Scroll to results on mobile
                if (window.innerWidth < 768) {
                    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 500);
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
    }, interval);
}

function displayMatches(matches) {
    const matchesList = document.getElementById('matches-list');
    matchesList.innerHTML = '';
    
    matches.forEach((match, index) => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 flex items-center justify-between hover:border-orange-500/50 transition-all';
        
        const waitingClass = match.waiting ? 'text-gray-500 italic' : 'text-white font-bold';
        const vsColor = match.waiting ? 'text-gray-600' : 'text-orange-500';
        
        matchCard.innerHTML = `
            <div class="flex items-center gap-4 flex-1">
                <div class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-lg">
                    ${index + 1}
                </div>
                <div class="flex-1 flex items-center justify-between md:justify-center gap-4">
                    <span class="text-lg font-semibold text-white truncate max-w-[120px] md:max-w-[200px]">${match.player1}</span>
                    <span class="text-2xl font-black ${vsColor} mx-2">×</span>
                    <span class="text-lg ${waitingClass} truncate max-w-[120px] md:max-w-[200px]">${match.player2}</span>
                </div>
            </div>
            ${!match.waiting ? `
                <div class="hidden md:flex items-center gap-2 text-gray-500">
                    <i data-lucide="swords" class="w-5 h-5"></i>
                </div>
            ` : ''}
        `;
        
        matchesList.appendChild(matchCard);
    });
    
    // Re-initialize Lucide icons for new elements
    lucide.createIcons();
}

// Scoreboard Functionality
let score1 = 0;
let score2 = 0;
const WINNING_SCORE = 11;
const MIN_DIFFERENCE = 2;

// Update display names in real-time
document.getElementById('player1-name').addEventListener('input', (e) => {
    document.getElementById('display-name1').textContent = e.target.value || 'Jogador 1';
});

document.getElementById('player2-name').addEventListener('input', (e) => {
    document.getElementById('display-name2').textContent = e.target.value || 'Jogador 2';
});

function updateScore(player, points) {
    const scoreElement = document.getElementById(`score${player}`);
    const container = document.getElementById(`score${player}-container`);
    const currentScore = player === 1 ? score1 : score2;
    const newScore = currentScore + points;
    
    // Prevent negative scores
    if (newScore < 0) return;
    
    // Update score
    if (player === 1) {
        score1 = newScore;
        scoreElement.textContent = score1;
    } else {
        score2 = newScore;
        scoreElement.textContent = score2;
    }
    
    // Add animation class
    scoreElement.classList.remove('score-pop', 'score-pop-player2');
    void scoreElement.offsetWidth; // Trigger reflow
    
    if (player === 1) {
        scoreElement.classList.add('score-pop');
    } else {
        scoreElement.classList.add('score-pop-player2');
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
        scoreElement.classList.remove('score-pop', 'score-pop-player2');
    }, 300);
    
    // Check for winner
    checkWinner();
}

function checkWinner() {
    const container1 = document.getElementById('score1-container');
    const container2 = document.getElementById('score2-container');
    const winner1 = document.getElementById('winner1');
    const winner2 = document.getElementById('winner2');
    
    // Reset winner states
    container1.classList.remove('winner-highlight');
    container2.classList.remove('winner-highlight');
    winner1.classList.add('hidden');
    winner2.classList.add('hidden');
    
    // Check if someone won (11 points with 2 point difference, or higher if tied at 10-10)
    let hasWinner = false;
    let winner = 0;
    
    if (score1 >= WINNING_SCORE && score1 - score2 >= MIN_DIFFERENCE) {
        hasWinner = true;
        winner = 1;
    } else if (score2 >= WINNING_SCORE && score2 - score1 >= MIN_DIFFERENCE) {
        hasWinner = true;
        winner = 2;
    }
    
    if (hasWinner) {
        if (winner === 1) {
            container1.classList.add('winner-highlight');
            winner1.classList.remove('hidden');
            celebrateWin(1);
        } else {
            container2.classList.add('winner-highlight');
            winner2.classList.remove('hidden');
            celebrateWin(2);
        }
    }
}

function celebrateWin(player) {
    // Add a subtle confetti effect using CSS
    const container = document.getElementById(`score${player}-container`);
    container.style.animation = 'none';
    setTimeout(() => {
        container.style.animation = '';
    }, 10);
}

function resetMatch() {
    score1 = 0;
    score2 = 0;
    
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';
    
    document.getElementById('score1-container').classList.remove('winner-highlight');
    document.getElementById('score2-container').classList.remove('winner-highlight');
    document.getElementById('winner1').classList.add('hidden');
    document.getElementById('winner2').classList.add('hidden');
    
    // Reset names to default if empty
    if (!document.getElementById('player1-name').value) {
        document.getElementById('player1-name').value = 'Jogador 1';
        document.getElementById('display-name1').textContent = 'Jogador 1';
    }
    if (!document.getElementById('player2-name').value) {
        document.getElementById('player2-name').value = 'Jogador 2';
        document.getElementById('display-name2').textContent = 'Jogador 2';
    }
    
    // Add reset animation
    document.getElementById('score1').classList.add('animate-pop');
    document.getElementById('score2').classList.add('animate-pop');
    setTimeout(() => {
        document.getElementById('score1').classList.remove('animate-pop');
        document.getElementById('score2').classList.remove('animate-pop');
    }, 300);
}

// Keyboard shortcuts for scoreboard
document.addEventListener('keydown', (e) => {
    // Only if scoreboard is visible
    const scoreboard = document.getElementById('scoreboard');
    const rect = scoreboard.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            updateScore(1, 1);
            break;
        case 'ArrowRight':
            updateScore(2, 1);
            break;
        case 'a':
        case 'A':
            updateScore(1, -1);
            break;
        case 'd':
        case 'D':
            updateScore(2, -1);
            break;
        case 'r':
        case 'R':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                resetMatch();
            }
            break;
    }
});

// Initialize Lucide icons when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add visual feedback for copy functionality (if needed in future)
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}