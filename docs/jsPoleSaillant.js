/* ================================
   FONCTIONS POUR LES DIAGRAMMES BLONDEL ET Diagrammededeuxréactances (PÔLE SAILLANT)
=============================== */

// Variables globales pour pôle saillant
let alphaSaillant = 0;
let lambdaSaillant = 0;
let tauSaillant = 0;
let XtSaillant = 0;
let XlSaillant = 0;
let KSaillant = 0;
let diagrammeActuelSaillant = '';
let diagrammeBlondelDataSaillant = null;
let lastTwoReactanceParamsSaillant = [];

// Variables pour l'animation
let animationIntervalSaillant = null;
let animationStepSaillant = 0;
let animationVectorsSaillant = [];
let animationProgressSaillant = 0;
let isAnimatingSaillant = false;

// Variables pour la nouvelle barre d'animation
let animationSpeedSaillant = 1000; // ms entre les étapes
let isAnimationPausedSaillant = false;
let stepDescriptionsSaillant = [];

// Variables pour l'animation et contrôle des vecteurs
let lastComputedDataSaillant = null;
let visibleVectorsSaillant = {
    blondel: ['V', 'I', 'RsI', 'lambdaI', 'tauI', 'Etr', 'Elr', 'E'],
    Diagrammededeuxréactances: ['V', 'I', 'RsI', 'XtI', 'jXlXtId', 'E']
};
let currentVisibleSaillant = {
    blondel: {
        'Animation': true,
        'V': true,
        'I': true,
        'RsI': true,
        'lambdaI': true,
        'tauI': true,
        'Etr': true,
        'Elr': true,
        'E': true
    },
    Diagrammededeuxréactances: {
        'Animation': true,
        'V': true,
        'I': true,
        'RsI': true,
        'XtI': true,
        'jXlXtId': true,
        'E': true
    }
};

// ================================
// FONCTIONS POUR LE CHOIX Rs/Req - PÔLE SAILLANT
// ================================

// Initialisation des écouteurs pour pôle saillant
document.addEventListener('DOMContentLoaded', function() {
    setupMachineTypeListenersSaillant();
    
    // Masquer le groupe de couplage par défaut (machine monophasée)
    const couplageGroup = document.getElementById('couplage-group-saillant');
    if (couplageGroup) {
        couplageGroup.style.display = 'none';
    }
    
    // Masquer les champs de choix Rs/Req par défaut
    const rsChoiceGroup = document.getElementById('rs-choice-group-saillant');
    const rsDirectChoice = document.getElementById('rs-direct-group-saillant-choice');
    const reqGroupChoice = document.getElementById('req-group-saillant-choice');
    
    if (rsChoiceGroup) rsChoiceGroup.style.display = 'none';
    if (rsDirectChoice) rsDirectChoice.style.display = 'none';
    if (reqGroupChoice) reqGroupChoice.style.display = 'none';
    
    // Afficher le champ Rs monophasé par défaut
    const rsDirectMonophase = document.getElementById('rs-direct-group-saillant-monophase');
    if (rsDirectMonophase) rsDirectMonophase.style.display = 'block';
});

// Fonction pour configurer les écouteurs d'événements pour le pôle saillant
function setupMachineTypeListenersSaillant() {
    // Pour pôle saillant
    const machineTypeRadiosSaillant = document.querySelectorAll('input[name="machine-type-saillant"]');
    machineTypeRadiosSaillant.forEach(radio => {
        radio.addEventListener('change', function() {
            const couplageGroup = document.getElementById('couplage-group-saillant');
            const rsDirectMonophase = document.getElementById('rs-direct-group-saillant-monophase');
            
            if (this.value === 'triphase') {
                couplageGroup.style.display = 'block';
                rsDirectMonophase.style.display = 'none';
                
                // Afficher le choix Rs/Req
                const rsChoiceGroup = document.getElementById('rs-choice-group-saillant');
                rsChoiceGroup.style.display = 'block';
                
                // Par défaut, afficher Rs direct
                const rsDirectChoice = document.getElementById('rs-direct-group-saillant-choice');
                const reqGroupChoice = document.getElementById('req-group-saillant-choice');
                rsDirectChoice.style.display = 'block';
                reqGroupChoice.style.display = 'none';
            } else {
                couplageGroup.style.display = 'none';
                rsDirectMonophase.style.display = 'block';
                
                // Masquer le choix Rs/Req
                const rsChoiceGroup = document.getElementById('rs-choice-group-saillant');
                rsChoiceGroup.style.display = 'none';
                
                // Masquer les champs de choix
                const rsDirectChoice = document.getElementById('rs-direct-group-saillant-choice');
                const reqGroupChoice = document.getElementById('req-group-saillant-choice');
                rsDirectChoice.style.display = 'none';
                reqGroupChoice.style.display = 'none';
            }
        });
    });
    
    // Gestion du changement de couplage pour pôle saillant
    const couplageRadiosSaillant = document.querySelectorAll('input[name="type-couplage-saillant"]');
    couplageRadiosSaillant.forEach(radio => {
        radio.addEventListener('change', function() {
            // Réinitialiser les champs si on change de couplage
            const reqInput = document.getElementById('req-saillant-choice');
            const rsResultat = document.getElementById('rs-resultat-saillant-choice');
            if (reqInput) reqInput.value = '';
            if (rsResultat) rsResultat.style.display = 'none';
        });
    });
    
    // Gestion du choix Rs/Req pour pôle saillant
    const rsChoiceRadiosSaillant = document.querySelectorAll('input[name="rs-choice-saillant"]');
    rsChoiceRadiosSaillant.forEach(radio => {
        radio.addEventListener('change', function() {
            const rsDirectChoice = document.getElementById('rs-direct-group-saillant-choice');
            const reqGroupChoice = document.getElementById('req-group-saillant-choice');
            const rsResultat = document.getElementById('rs-resultat-saillant-choice');
            
            if (this.value === 'direct') {
                if (rsDirectChoice) rsDirectChoice.style.display = 'block';
                if (reqGroupChoice) reqGroupChoice.style.display = 'none';
                if (rsResultat) rsResultat.style.display = 'none';
            } else if (this.value === 'req') {
                if (rsDirectChoice) rsDirectChoice.style.display = 'none';
                if (reqGroupChoice) reqGroupChoice.style.display = 'block';
                if (rsResultat) rsResultat.style.display = 'none';
            }
        });
    });
}

// Fonction pour calculer Rs à partir de Req pour pôle saillant
function calculerRsFromReqSaillant() {
    const machineType = document.querySelector('input[name="machine-type-saillant"]:checked').value;
    const couplage = document.querySelector('input[name="type-couplage-saillant"]:checked')?.value;
    const reqInput = document.getElementById('req-saillant-choice');
    const reqValue = parseFloat(reqInput.value);
    
    const rsResultat = document.getElementById('rs-resultat-saillant-choice');
    const valeurRs = document.getElementById('valeur-rs-saillant-choice');
    const rsInputMonophase = document.getElementById('rs-saillant-monophase');
    const rsInputDirectChoice = document.getElementById('rs-saillant-direct-choice');
    
    if (isNaN(reqValue) || reqValue <= 0) {
        alert('Veuillez entrer une valeur valide pour Req (résistance totale aux bornes du stator).');
        return;
    }
    
    let rsCalculated = 0;
    let formule = '';
    
    if (machineType === 'triphase') {
        if (couplage === 'etoile') {
            // Pour couplage étoile: Req = 2*Rs => Rs = Req/2
            rsCalculated = reqValue / 2;
            formule = 'Rs = Req/2';
        } else if (couplage === 'triangle') {
            // Pour couplage triangle: Req = (2*Rs)/3 => Rs = (3*Req)/2
            rsCalculated = (3 * reqValue) / 2;
            formule = 'Rs = (3×Req)/2';
        }
    }
    
    // Afficher le résultat
    if (valeurRs) {
        valeurRs.textContent = `${rsCalculated.toFixed(4)} Ω (${formule})`;
    }
    if (rsResultat) {
        rsResultat.style.display = 'block';
    }
    
    // Mettre à jour la valeur dans le champ Rs approprié
    if (machineType === 'triphase') {
        if (rsInputDirectChoice) {
            rsInputDirectChoice.value = rsCalculated.toFixed(4);
        }
    } else {
        if (rsInputMonophase) {
            rsInputMonophase.value = rsCalculated.toFixed(4);
        }
    }
    
    // Faire défiler jusqu'au résultat
    if (rsResultat) {
        rsResultat.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Fonction pour obtenir la valeur de Rs pour pôle saillant
function getRsValueSaillant() {
    const machineType = document.querySelector('input[name="machine-type-saillant"]:checked').value;
    
    if (machineType === 'monophase') {
        const rsInput = document.getElementById('rs-saillant-monophase');
        return parseFloat(rsInput?.value) || 0;
    } else {
        const rsChoice = document.querySelector('input[name="rs-choice-saillant"]:checked')?.value;
        
        if (rsChoice === 'direct') {
            const rsInput = document.getElementById('rs-saillant-direct-choice');
            return parseFloat(rsInput?.value) || 0;
        } else {
            // Si l'utilisateur a choisi Req mais n'a pas calculé Rs
            const rsResultat = document.getElementById('rs-resultat-saillant-choice');
            if (rsResultat && rsResultat.style.display === 'none') {
                alert('Veuillez d\'abord calculer Rs à partir de Req.');
                return 0;
            } else {
                const rsInput = document.getElementById('rs-saillant-direct-choice');
                return parseFloat(rsInput?.value) || 0;
            }
        }
    }
}

// ================================
// FONCTIONS EXISTANTES PÔLE SAILLANT
// ================================

// Fonctions pour les tableaux pôle saillant
function getDonneesVideSaillant() {
    const donnees = [];
    const lignes = document.querySelectorAll('#tbody-vide-saillant tr');
    
    lignes.forEach(ligne => {
        const E = parseFloat(ligne.querySelector('.input-vide-e').value);
        const J = parseFloat(ligne.querySelector('.input-vide-j').value);
        
        if (!isNaN(E) && !isNaN(J)) {
            donnees.push({ J, E });
        }
    });
    
    // Trier par J croissant
    return donnees.sort((a, b) => a.J - b.J);
}

function getDonneesCCSaillant() {
    const donnees = [];
    const lignes = document.querySelectorAll('#tbody-cc-saillant tr');
    
    lignes.forEach(ligne => {
        const Icc = parseFloat(ligne.querySelector('.input-cc-icc').value);
        const J = parseFloat(ligne.querySelector('.input-cc-j').value);
        
        if (!isNaN(Icc) && !isNaN(J)) {
            donnees.push({ J, Icc });
        }
    });
    
    // Trier par J croissant
    return donnees.sort((a, b) => a.J - b.J);
}

function ajouterLigneSaillant(type) {
    const tbodyId = 'tbody-' + type + '-saillant';
    const tbody = document.getElementById(tbodyId);
    
    if (!tbody) return;
    
    const newRow = document.createElement('tr');
    
    if (type === 'vide') {
        newRow.innerHTML = `
            <td><input type="number" class="input-vide-e" placeholder="0" value="0"></td>
            <td><input type="number" class="input-vide-j" placeholder="0" value="0"></td>
            <td>
                <button class="btn-tableau" onclick="supprimerLigneSaillant('${type}', this)">Supprimer</button>
            </td>
        `;
    } else if (type === 'cc') {
        newRow.innerHTML = `
            <td><input type="number" class="input-cc-icc" placeholder="0" value="0"></td>
            <td><input type="number" class="input-cc-j" placeholder="0" value="0"></td>
            <td>
                <button class="btn-tableau" onclick="supprimerLigneSaillant('${type}', this)">Supprimer</button>
            </td>
        `;
    }
    
    tbody.appendChild(newRow);
}

function supprimerLigneSaillant(type, button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function viderTableauSaillant(type) {
    if (confirm("Êtes-vous sûr de vouloir supprimer toutes les lignes de ce tableau ?")) {
        const tbodyId = 'tbody-' + type + '-saillant';
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
            tbody.innerHTML = '';
            
            // Ajouter quelques lignes vides selon le type
            if (type === 'vide') {
                for (let i = 0; i < 3; i++) {
                    ajouterLigneSaillant('vide');
                }
            } else if (type === 'cc') {
                for (let i = 0; i < 2; i++) {
                    ajouterLigneSaillant('cc');
                }
            }
        }
    }
}

// Calculer α et λ par la méthode de Potier pour pôle saillant
function calculerAlphaLambdaSaillant() {
    // Récupérer les données
    const donneesVide = getDonneesVideSaillant();
    const donneesCC = getDonneesCCSaillant();
    const Vd = parseFloat(document.getElementById('vd-saillant').value) || 0;
    const Id = parseFloat(document.getElementById('id-saillant').value) || 0;
    const Jd = parseFloat(document.getElementById('jd-saillant').value) || 0;
    const cosPhiD = parseFloat(document.getElementById('cosphi-dewatte-saillant').value) || 0.8;
    const Rs = getRsValueSaillant(); // MODIFIÉ: Utiliser la nouvelle fonction
    
    // Vérifier les données
    if (donneesVide.length < 2) {
        alert("Veuillez saisir au moins 2 points pour la caractéristique à vide.");
        return;
    }
    
    if (donneesCC.length < 2) {
        alert("Veuillez saisir au moins 2 points pour l'essai en court-circuit.");
        return;
    }
    
    if (Vd <= 0 || Id <= 0 || Jd <= 0) {
        alert("Veuillez saisir des valeurs positives pour l'essai dewatté.");
        return;
    }
    
    if (Rs <= 0) {
        alert("Veuillez saisir une valeur positive pour la résistance Rs.");
        return;
    }
    
    // 1. Calcul de la pente de la tangente à l'origine (méthode Potier)
    let penteTangente = 0;
    if (donneesVide.length >= 2) {
        const point1 = donneesVide[0];
        const point2 = donneesVide[1];
        penteTangente = (point2.E - point1.E) / (point2.J - point1.J);
    }
    
    // 2. Calcul de la pente de la caractéristique court-circuit (k)
    let k = 0;
    if (donneesCC.length >= 2) {
        let sumJIcc = 0;
        let sumJ2 = 0;
        
        donneesCC.forEach(point => {
            sumJIcc += point.J * point.Icc;
            sumJ2 += point.J * point.J;
        });
        
        k = sumJIcc / sumJ2;
    }
    
    // 3. Calcul de Jccd = Id / k
    const Jccd = Id / k;
    
    // 4. Points de la construction de Potier
    const O = { J: 0, E: 0 };
    const M = { J: Jd, E: Vd };
    const Mprime = { J: Jccd, E: 0 };
    
    // 5. Distance OM'
    const distanceOMprime = Math.sqrt(Math.pow(Mprime.J - O.J, 2) + Math.pow(Mprime.E - O.E, 2));
    
    // 6. Point N (report de OM' sur l'horizontale passant par M)
    const N = {
        J: M.J - distanceOMprime,
        E: M.E
    };
    
    // 7. Équation de la parallèle à la tangente passant par N
    const b = N.E - penteTangente * N.J;
    
    // 8. Trouver l'intersection T entre la caractéristique à vide et la parallèle
    let T = null;
    for (let i = 0; i < donneesVide.length - 1; i++) {
        const p1 = donneesVide[i];
        const p2 = donneesVide[i + 1];
        
        const E_paral1 = penteTangente * p1.J + b;
        const E_paral2 = penteTangente * p2.J + b;
        
        if ((p1.E <= E_paral1 && p2.E >= E_paral2) || 
            (p1.E >= E_paral1 && p2.E <= E_paral2)) {
            
            const t = (E_paral1 - p1.E) / ((p2.E - p1.E) - (E_paral2 - E_paral1));
            T = {
                J: p1.J + t * (p2.J - p1.J),
                E: p1.E + t * (p2.E - p1.E)
            };
            break;
        }
    }
    
    if (!T) {
        T = donneesVide[donneesVide.length - 1];
    }
    
    // 9. Point S (projection verticale de T sur MN)
    const S = {
        J: T.J,
        E: M.E
    };
    
    // 10. Calcul de α et λ
    const MS = Math.abs(M.J - S.J);
    const TS = Math.abs(T.E - S.E);
    
    alphaSaillant = MS / Id;
    lambdaSaillant = TS / Id;
    
    // Afficher les résultats
    afficherParametresCalculesSaillant();
    
    return { alpha: alphaSaillant, lambda: lambdaSaillant };
}

// Calculer Xt et Xl à partir de l'essai de glissement pour pôle saillant
function calculerXtXlSaillant() {
    const V_glissement = parseFloat(document.getElementById('v-glissement-saillant').value) || 0;
    const Imax = parseFloat(document.getElementById('imax-saillant').value) || 0;
    const Imin = parseFloat(document.getElementById('imin-saillant').value) || 0;
    const Rs = getRsValueSaillant(); // MODIFIÉ: Utiliser la nouvelle fonction
    
    if (V_glissement <= 0) {
        alert("Veuillez saisir une tension positive pour l'essai de glissement.");
        return;
    }
    
    if (Imax <= 0 || Imin <= 0) {
        alert("Veuillez saisir des valeurs positives pour Imax et Imin.");
        return;
    }
    
    if (Imax <= Imin) {
        alert("Imax doit être supérieur à Imin.");
        return;
    }
    
    if (Rs <= 0) {
        alert("Veuillez d'abord calculer la résistance Rs.");
        return;
    }
    
    // Calcul de Xt = sqrt((V/Imax)² - Rs²)
    const Zt = V_glissement / Imax;
    XtSaillant = Math.sqrt(Math.pow(Zt, 2) - Math.pow(Rs, 2));
    
    // Calcul de Xl = sqrt((V/Imin)² - Rs²)
    const Zl = V_glissement / Imin;
    XlSaillant = Math.sqrt(Math.pow(Zl, 2) - Math.pow(Rs, 2));
    
    // Calculer K (pente de la caractéristique à vide) à partir du 2ème point
    const donneesVide = getDonneesVideSaillant();
    if (donneesVide.length >= 2) {
        const point2 = donneesVide[1];
        KSaillant = point2.E / point2.J;
    }
    
    // Vérifier que Xl > Xt (condition pour pôles saillants)
    if (XlSaillant <= XtSaillant) {
        alert("Attention: Xl (" + XlSaillant.toFixed(4) + " Ω) devrait être supérieur à Xt (" + XtSaillant.toFixed(4) + " Ω) pour une machine à pôles saillants.");
    }
    
    // Afficher les résultats
    afficherParametresCalculesSaillant();
    
    return { Xt: XtSaillant, Xl: XlSaillant, K: KSaillant };
}

// Calculer tous les paramètres pour pôle saillant
function calculerTousParametresSaillant() {
    const resultAlphaLambda = calculerAlphaLambdaSaillant();
    const resultXtXl = calculerXtXlSaillant();
}

// Afficher les paramètres calculés pour pôle saillant
function afficherParametresCalculesSaillant() {
    const html = `
        <div class="param-card">
            <div class="param-label">Coefficient α</div>
            <div class="param-value">${alphaSaillant.toFixed(4)}</div>
        </div>
        <div class="param-card">
            <div class="param-label">Réactance λ</div>
            <div class="param-value">${lambdaSaillant.toFixed(4)} Ω</div>
        </div>
        <div class="param-card">
            <div class="param-label">Réactance Xt</div>
            <div class="param-value">${XtSaillant.toFixed(4)} Ω</div>
        </div>
        <div class="param-card">
            <div class="param-label">Réactance Xl</div>
            <div class="param-value">${XlSaillant.toFixed(4)} Ω</div>
        </div>
        <div class="param-card">
            <div class="param-label">Constante K</div>
            <div class="param-value">${KSaillant.toFixed(4)} V/A</div>
        </div>
    `;
    
    document.getElementById('parametres-calcules-saillant').innerHTML = html;
    document.getElementById('zone-parametres-calcules-saillant').style.display = 'block';
}

// Configuration des couleurs pour Blondel
const colorsSaillant = {
    V: "#2196F3",
    I: "#4CAF50",
    RI: "#FF9800",
    lambdaI: "#9C27B0",
    tauI: "#00BCD4",
    droiteSupport: "#795548",
    Etr: "#FF5722",
    Elr: "#3F51B5",
    E: "#009688",
    Jlr: "#E91E63",
    J: "#F44336",
    phi: "#FF9800",
    psi: "#2196F3",
    grid: "#E0E0E0",
    axis: "#333333",
    text: "#000000"
};

// Configuration des couleurs pour Diagrammededeuxréactances
const colorsDiagrammededeuxréactances = {
    V: "#2196F3",
    I: "#4CAF50",
    RsI: "#FF9800",
    XtI: "#9C27B0",
    jXlXtId: "#FF5722",
    E: "#F44336",
    grid: "#E0E0E0",
    axis: "#333333",
    text: "#000000"
};

// Fonction pour gérer les cases à cocher
function setupVectorControlsSaillant() {
    const vectorsContainer = document.getElementById('vectors-saillant');
    if (!vectorsContainer) return;
    
    const checkboxes = vectorsContainer.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const vectorName = checkbox.getAttribute('data-vector');
            if (vectorName === 'Animation') {
                currentVisibleSaillant[diagrammeActuelSaillant][vectorName] = checkbox.checked;
                // Démarrer ou arrêter l'animation
                if (checkbox.checked && isAnimatingSaillant === false) {
                    replayAnimationSaillant();
                } else if (!checkbox.checked) {
                    stopAnimationSaillant();
                }
            } else {
                currentVisibleSaillant[diagrammeActuelSaillant][vectorName] = checkbox.checked;
                
                // Redessiner le diagramme avec les nouveaux paramètres
                if (diagrammeActuelSaillant === 'blondel') {
                    dessinerDiagrammeBlondelSaillant();
                } else if (diagrammeActuelSaillant === 'Diagrammededeuxréactances') {
                    if (lastTwoReactanceParamsSaillant.length > 0) {
                        const [V, I, phiSigne, psi, deltaRad, Rs, Xt, Xl, E, J, typeCharge] = lastTwoReactanceParamsSaillant;
                        drawTwoReactanceSaillant(V, I, phiSigne, psi, deltaRad, Rs, Xt, Xl, E, typeCharge);
                    }
                }
            }
        });
    });
}

// Fonction pour mettre à jour les contrôles d'animation
function updateAnimationControls() {
    const animationCheckbox = document.querySelector('#vectors-saillant input[data-vector="Animation"]');
    if (animationCheckbox) {
        animationCheckbox.checked = currentVisibleSaillant[diagrammeActuelSaillant].Animation;
    }
    
    const replayButton = document.querySelector('.btn-replay');
    if (replayButton) {
        if (isAnimatingSaillant) {
            replayButton.disabled = true;
            replayButton.innerHTML = '⏸️ Animation en cours';
        } else {
            replayButton.disabled = false;
            replayButton.innerHTML = '🔄 Revoir l\'animation';
        }
    }
}

function stopAnimationSaillant() {
    if (animationIntervalSaillant) {
        clearInterval(animationIntervalSaillant);
        animationIntervalSaillant = null;
    }
    isAnimatingSaillant = false;
    isAnimationPausedSaillant = false;
    animationStepSaillant = 0;
    animationProgressSaillant = 0;
    updateAnimationControls();
    updateAnimationBarSaillant();
}

function replayAnimationSaillant() {
    if (!currentVisibleSaillant[diagrammeActuelSaillant] || !currentVisibleSaillant[diagrammeActuelSaillant].Animation) {
        // Activer l'animation si elle est désactivée
        currentVisibleSaillant[diagrammeActuelSaillant].Animation = true;
        updateAnimationControls();
    }
    
    stopAnimationSaillant();
    
    // Initialiser les descriptions
    initStepDescriptionsSaillant(diagrammeActuelSaillant);
    
    if (diagrammeActuelSaillant === 'blondel' && diagrammeBlondelDataSaillant) {
        startBlondelAnimationSaillant();
    } else if (diagrammeActuelSaillant === 'Diagrammededeuxréactances' && lastTwoReactanceParamsSaillant.length > 0) {
        startDiagrammededeuxréactancesAnimationSaillant();
    }
    
    updateAnimationBarSaillant();
}

// Initialiser les descriptions des étapes
function initStepDescriptionsSaillant(diagramType) {
    if (diagramType === 'blondel') {
        stepDescriptionsSaillant = [
            {
                title: "Tension V",
                details: "Représente la tension aux bornes de la machine synchrone",
                equation: "V = V∠0°"
            },
            {
                title: "Courant I",
                details: "Courant d'induit avec son déphasage φ par rapport à la tension",
                equation: "I = I∠φ"
            },
            {
                title: "Chute ohmique Rs·I",
                details: "Chute de tension due à la résistance d'induit",
                equation: "Rs·I = Rs × I (en phase avec I)"
            },
            {
                title: "Chute réactive λ·I",
                details: "Chute de tension due à la réactance de fuite",
                equation: "jλ·I = λ × I∠(φ + 90°)"
            },
            {
                title: "Chute réactive τ·I",
                details: "Chute de tension due à la réactance transversale",
                equation: "jτ·I = τ × I∠(φ + 90°)"
            },
            {
                title: "FEM transversale Etr",
                details: "Composante transversale de la force électromotrice",
                equation: "Etr = τ·I × cos(ψ)"
            },
            {
                title: "FEM longitudinale Elr",
                details: "Composante longitudinale de la FEM sur l'axe direct",
                equation: "Elr = projection de V sur l'axe d"
            },
            {
                title: "FEM totale E",
                details: "Force électromotrice totale de la machine",
                equation: "E = √(Elr² + Etr²)"
            }
        ];
    } else if (diagramType === 'Diagrammededeuxréactances') {
        stepDescriptionsSaillant = [
            {
                title: "Tension V",
                details: "Tension aux bornes de la machine",
                equation: "V = V∠0°"
            },
            {
                title: "Courant I",
                details: "Courant d'induit avec déphasage φ",
                equation: "I = I∠φ"
            },
            {
                title: "Chute ohmique Rs·I",
                details: "Chute due à la résistance d'induit",
                equation: "Rs·I = Rs × I"
            },
            {
                title: "Chute réactive Xt·I",
                details: "Chute due à la réactance transversale",
                equation: "jXt·I = Xt × I∠(φ + 90°)"
            },
            {
                title: "Chute (Xl-Xt)·Id",
                details: "Chute due à la différence des réactances",
                equation: "j(Xl-Xt)·Id = (Xl-Xt) × Id∠(ψ + 90°)"
            },
            {
                title: "FEM E",
                details: "Force électromotrice totale",
                equation: "E = V + Rs·I + jXt·I + j(Xl-Xt)·Id"
            }
        ];
    }
}

// Mettre à jour la barre d'animation
function updateAnimationBarSaillant() {
    const animationBar = document.getElementById('animation-bar-saillant');
    if (!animationBar) return;
    
    if (isAnimatingSaillant || animationStepSaillant > 0) {
        // Afficher la barre d'animation
        animationBar.style.display = 'block';
        
        // Mettre à jour la progression
        const progress = (animationStepSaillant / animationVectorsSaillant.length) * 100;
        document.getElementById('progress-fill-saillant').style.width = `${progress}%`;
        
        // Mettre à jour les labels
        document.getElementById('current-step-saillant').textContent = 
            `Étape ${animationStepSaillant}`;
        document.getElementById('total-steps-saillant').textContent = 
            `sur ${animationVectorsSaillant.length} étapes`;
        
        // Mettre à jour l'indicateur d'étape
        document.getElementById('step-number-saillant').textContent = 
            animationStepSaillant;
        document.getElementById('step-total-saillant').textContent = 
            `sur ${animationVectorsSaillant.length}`;
        
        // Mettre à jour la description
        if (animationStepSaillant > 0 && animationStepSaillant <= stepDescriptionsSaillant.length) {
            const stepDesc = stepDescriptionsSaillant[animationStepSaillant - 1];
            document.getElementById('step-title-saillant').textContent = 
                `Étape ${animationStepSaillant}: ${stepDesc.title}`;
            document.getElementById('step-details-saillant').textContent = stepDesc.details;
            document.getElementById('step-equation-saillant').textContent = stepDesc.equation;
            document.getElementById('step-equation-saillant').style.display = 'block';
        } else if (animationStepSaillant === 0) {
            document.getElementById('step-title-saillant').textContent = 'Prêt à démarrer';
            document.getElementById('step-details-saillant').textContent = 
                'Activez l\'animation pour voir la construction étape par étape du diagramme.';
            document.getElementById('step-equation-saillant').style.display = 'none';
        }
        
        // Mettre à jour les boutons de contrôle
        const playBtn = document.getElementById('play-btn-saillant');
        const pauseBtn = document.getElementById('pause-btn-saillant');
        const restartBtn = document.getElementById('restart-btn-saillant');
        const completeDiv = document.getElementById('animation-complete-saillant');
        
        if (isAnimationPausedSaillant) {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Reprendre';
        } else if (isAnimatingSaillant) {
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i> En cours...';
        } else {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Démarrer';
        }
        
        // Afficher/masquer le message de complétion
        if (animationStepSaillant >= animationVectorsSaillant.length && !isAnimatingSaillant) {
            completeDiv.style.display = 'block';
        } else {
            completeDiv.style.display = 'none';
        }
    } else {
        animationBar.style.display = 'none';
    }
}

// Contrôles d'animation
function playAnimationSaillant() {
    if (isAnimatingSaillant && !isAnimationPausedSaillant) return;
    
    if (isAnimationPausedSaillant) {
        // Reprendre l'animation
        isAnimationPausedSaillant = false;
        updateAnimationBarSaillant();
    } else if (!isAnimatingSaillant) {
        // Démarrer une nouvelle animation
        replayAnimationSaillant();
    }
}

function pauseAnimationSaillant() {
    if (isAnimatingSaillant && !isAnimationPausedSaillant) {
        isAnimationPausedSaillant = true;
        updateAnimationBarSaillant();
    }
}

function restartAnimationSaillant() {
    stopAnimationSaillant();
    animationStepSaillant = 0;
    updateAnimationBarSaillant();
    setTimeout(() => {
        playAnimationSaillant();
    }, 500);
}

// Démarrer l'animation Blondel
function startBlondelAnimationSaillant() {
    if (!diagrammeBlondelDataSaillant) return;
    
    animationVectorsSaillant = [];
    animationStepSaillant = 0;
    animationProgressSaillant = 0;
    isAnimatingSaillant = true;
    isAnimationPausedSaillant = false;
    
    const v = diagrammeBlondelDataSaillant.vecteurs;
    const p = diagrammeBlondelDataSaillant.parametres;
    const pts = diagrammeBlondelDataSaillant.points;
    
    // Définir l'ordre des vecteurs pour l'animation
    animationVectorsSaillant = [
        { name: 'V', color: colorsSaillant.V, from: {x: 0, y: 0}, to: v.V },
        { name: 'I', color: colorsSaillant.I, from: {x: 0, y: 0}, to: v.I },
        { name: 'RsI', color: colorsSaillant.RI, from: v.V, to: {x: v.V.x + v.RI.x, y: v.V.y + v.RI.y} },
        { name: 'lambdaI', color: colorsSaillant.lambdaI, from: {x: v.V.x + v.RI.x, y: v.V.y + v.RI.y}, to: pts.P },
        { name: 'tauI', color: colorsSaillant.tauI, from: pts.P, to: pts.G },
        { name: 'Etr', color: colorsSaillant.Etr, from: pts.P, to: pts.T },
        { name: 'Elr', color: colorsSaillant.Elr, from: {x: 0, y: 0}, to: v.Elr },
        { name: 'E', color: colorsSaillant.E, from: {x: 0, y: 0}, to: v.E }
    ];
    
    // Initialiser la barre d'animation
    updateAnimationBarSaillant();
    
    // Démarrer l'animation
    animationIntervalSaillant = setInterval(animateBlondelStepSaillant, animationSpeedSaillant);
}

// Animer une étape Blondel
function animateBlondelStepSaillant() {
    if (isAnimationPausedSaillant) return;
    
    if (animationStepSaillant >= animationVectorsSaillant.length) {
        stopAnimationSaillant();
        dessinerDiagrammeBlondelSaillant();
        updateAnimationBarSaillant();
        return;
    }
    
    // Calculer le progrès
    animationProgressSaillant = (animationStepSaillant + 1) / animationVectorsSaillant.length;
    
    // Dessiner le diagramme avec l'animation actuelle
    dessinerDiagrammeBlondelSaillant(animationStepSaillant);
    
    // Mettre à jour la barre d'animation
    updateAnimationBarSaillant();
    
    animationStepSaillant++;
}

// Démarrer l'animation Diagrammededeuxréactances
function startDiagrammededeuxréactancesAnimationSaillant() {
    const [V, I, phiSigne, psi, delta, Rs, Xt, Xl, E, J, typeCharge] = lastTwoReactanceParamsSaillant;
    
    // Calculer les points pour l'animation
    const Vx = V;
    const Vy = 0;
    const Ix = I * Math.cos(phiSigne);
    const Iy = I * Math.sin(phiSigne);
    const RsIx = Rs * I * Math.cos(phiSigne);
    const RsIy = Rs * I * Math.sin(phiSigne);
    const XtIx = -Xt * I * Math.sin(phiSigne);
    const XtIy = Xt * I * Math.cos(phiSigne);
    const Ax = Vx + RsIx + XtIx;
    const Ay = Vy + RsIy + XtIy;
    const angleSupport = Math.atan2(Ay, Ax);
    const Id = I * Math.sin(psi);
    const deltaX = Xl - Xt;
    const deltaXId_x = -deltaX * Id * Math.sin(angleSupport);
    const deltaXId_y = deltaX * Id * Math.cos(angleSupport);
    const Ex = E * Math.cos(angleSupport);
    const Ey = E * Math.sin(angleSupport);
    
    animationVectorsSaillant = [];
    animationStepSaillant = 0;
    animationProgressSaillant = 0;
    isAnimatingSaillant = true;
    isAnimationPausedSaillant = false;
    
    // Définir l'ordre des vecteurs pour l'animation Diagrammededeuxréactances
    animationVectorsSaillant = [
        { name: 'V', color: colorsDiagrammededeuxréactances.V, from: {x: 0, y: 0}, to: {x: Vx, y: Vy} },
        { name: 'I', color: colorsDiagrammededeuxréactances.I, from: {x: 0, y: 0}, to: {x: Ix, y: Iy} },
        { name: 'RsI', color: colorsDiagrammededeuxréactances.RsI, from: {x: Vx, y: Vy}, to: {x: Vx + RsIx, y: Vy + RsIy} },
        { name: 'XtI', color: colorsDiagrammededeuxréactances.XtI, from: {x: Vx + RsIx, y: Vy + RsIy}, to: {x: Ax, y: Ay} },
        { name: 'jXlXtId', color: colorsDiagrammededeuxréactances.jXlXtId, from: {x: Ax, y: Ay}, to: {x: Ex, y: Ey} },
        { name: 'E', color: colorsDiagrammededeuxréactances.E, from: {x: 0, y: 0}, to: {x: Ex, y: Ey} }
    ];
    
    // Initialiser la barre d'animation
    updateAnimationBarSaillant();
    
    animationIntervalSaillant = setInterval(animateDiagrammededeuxréactancesStepSaillant, animationSpeedSaillant);
}

// Animer une étape Diagrammededeuxréactances
function animateDiagrammededeuxréactancesStepSaillant() {
    if (isAnimationPausedSaillant) return;
    
    if (animationStepSaillant >= animationVectorsSaillant.length) {
        stopAnimationSaillant();
        if (lastTwoReactanceParamsSaillant.length > 0) {
            const [V, I, phiSigne, psi, deltaRad, Rs, Xt, Xl, E, J, typeCharge] = lastTwoReactanceParamsSaillant;
            drawTwoReactanceSaillant(V, I, phiSigne, psi, deltaRad, Rs, Xt, Xl, E, typeCharge);
        }
        updateAnimationBarSaillant();
        return;
    }
    
    animationProgressSaillant = (animationStepSaillant + 1) / animationVectorsSaillant.length;
    
    // Dessiner le diagramme avec l'animation actuelle
    if (lastTwoReactanceParamsSaillant.length > 0) {
        const [V, I, phiSigne, psi, deltaRad, Rs, Xt, Xl, E, J, typeCharge] = lastTwoReactanceParamsSaillant;
        drawTwoReactanceSaillant(V, I, phiSigne, psi, deltaRad, Rs, Xt, Xl, E, typeCharge, animationStepSaillant);
    }
    
    // Mettre à jour la barre d'animation
    updateAnimationBarSaillant();
    
    animationStepSaillant++;
}

// Fonction pour peupler les contrôles de vecteurs
function populateVectorControlsSaillant(diagramType) {
    const vectorsContainer = document.getElementById('vectors-saillant');
    if (!vectorsContainer) return;
    
    vectorsContainer.innerHTML = '';
    
    let vectors = [];
    if (diagramType === 'blondel') {
        vectors = ['Animation', 'V', 'I', 'RsI', 'lambdaI', 'tauI', 'Etr', 'Elr', 'E'];
    } else if (diagramType === 'Diagrammededeuxréactances') {
        vectors = ['Animation', 'V', 'I', 'RsI', 'XtI', 'jXlXtId', 'E'];
    }
    
    vectors.forEach((vector, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        const isChecked = currentVisibleSaillant[diagramType] && currentVisibleSaillant[diagramType][vector];
        label.innerHTML = `
            <input type="checkbox" ${isChecked ? 'checked' : ''} data-vector="${vector}">
            <span class="vector-label">${vector}</span>
        `;
        vectorsContainer.appendChild(label);
    });
    
    // Configurer les écouteurs
    setupVectorControlsSaillant();
    
    // Initialiser la barre d'animation si l'animation est activée
    if (currentVisibleSaillant[diagramType].Animation) {
        initStepDescriptionsSaillant(diagramType);
        updateAnimationBarSaillant();
    }
}

// Tracer le diagramme de Blondel pour pôle saillant
function tracerDiagrammeBlondelSaillant() {
    diagrammeActuelSaillant = 'blondel';
    
    // Vérifier que α et λ ont été calculés
    if (alphaSaillant === 0 || lambdaSaillant === 0) {
        alert("Veuillez d'abord calculer α et λ par la méthode de Potier.");
        return;
    }
    
    // Récupérer les paramètres
    const typeMachine = document.querySelector('input[name="machine-type-saillant"]:checked').value;
    const typeCouplage = document.querySelector('input[name="type-couplage-saillant"]:checked')?.value || 'etoile';
    const Rs = getRsValueSaillant(); // MODIFIÉ: Utiliser la nouvelle fonction
    const V_saisie = parseFloat(document.getElementById('v-saillant').value) || 220;
    const I_saisie = parseFloat(document.getElementById('i-saillant').value) || 10;
    const cosPhi = parseFloat(document.getElementById('cosphi-saillant').value) || 0.8;
    const typeCharge = document.getElementById('nature-saillant').value;
    const mode = document.getElementById('mode-saillant').value;
    const donneesVide = getDonneesVideSaillant();
    
    // Vérifier que Rs a été calculée
    if (Rs <= 0) {
        alert("Veuillez d'abord calculer la résistance Rs.");
        return;
    }
    
    // Calculer τ = Xq - λ (Xq est estimé comme Xl pour Diagrammededeuxréactances)
    const Xq = XlSaillant;
    tauSaillant = Xq - lambdaSaillant;
    
    if (tauSaillant < 0) {
        tauSaillant = Xq * 0.6;
    }
    
    // Vérifier les données
    if (donneesVide.length < 2) {
        alert("Veuillez saisir au moins 2 points pour la caractéristique à vide.");
        return;
    }
    
    // 1. Calcul des tensions et courants
    let V, I;
    if (typeMachine === "monophase") {
        V = V_saisie;
        I = I_saisie;
    } else {
        V = V_saisie;
        I = I_saisie;
    }
    
    // 2. Calcul de l'angle φ (V-I)
    const phi = Math.acos(cosPhi);
    let phiFinal;
    
    if (typeCharge === "inductive") {
        phiFinal = (mode === "alternateur") ? -phi : phi;
    } else if (typeCharge === "capacitive") {
        phiFinal = (mode === "alternateur") ? phi : -phi;
    } else {
        phiFinal = 0;
    }
    
    // 3. Calcul des vecteurs
    const Vx = V;
    const Vy = 0;
    
    const Ix = I * Math.cos(phiFinal);
    const Iy = I * Math.sin(phiFinal);
    
    const RIx = Rs * I * Math.cos(phiFinal);
    const RIy = Rs * I * Math.sin(phiFinal);
    
    const lambdaIx = -lambdaSaillant * I * Math.sin(phiFinal);
    const lambdaIy = lambdaSaillant * I * Math.cos(phiFinal);
    
    const Px = Vx + RIx + lambdaIx;
    const Py = Vy + RIy + lambdaIy;
    
    const tauIx = -tauSaillant * I * Math.sin(phiFinal);
    const tauIy = tauSaillant * I * Math.cos(phiFinal);
    
    const Gx = Px + tauIx;
    const Gy = Py + tauIy;
    
    // 4. Droite support de E
    const droiteSupportAngle = Math.atan2(Gy, Gx);
    
    // 5. Calcul de l'angle ψ
    const angleE = droiteSupportAngle;
    const angleI = Math.atan2(Iy, Ix);
    const psi = angleE - angleI;
    
    // 6. Calcul de Etr
    const tauI_magnitude = Math.sqrt(tauIx * tauIx + tauIy * tauIy);
    const Etr_magnitude = tauI_magnitude * Math.cos(psi);
    
    const Etrx = -Etr_magnitude * Math.sin(droiteSupportAngle);
    const Etry = Etr_magnitude * Math.cos(droiteSupportAngle);
    
    const Tx = Px + Etrx;
    const Ty = Py + Etry;
    
    // 7. Calcul de Elr
    const Elr_magnitude = (Px * Math.cos(droiteSupportAngle) + Py * Math.sin(droiteSupportAngle));
    const Elrx = Elr_magnitude * Math.cos(droiteSupportAngle);
    const Elry = Elr_magnitude * Math.sin(droiteSupportAngle);
    
    // 8. Interpolation pour trouver Jlr
    const Elr_value = Math.sqrt(Elrx * Elrx + Elry * Elry);
    let Jlr = interpolerValeurSaillant(Elr_value, donneesVide, 'E', 'J');
    
    // 9. Calcul de J = Jlr + α·I·sin(ψ)
    const J_value = Jlr + alphaSaillant * I * Math.sin(psi);
    
    // 10. Interpolation pour trouver E
    const E_value = interpolerValeurSaillant(J_value, donneesVide, 'J', 'E');
    
    const Ex = E_value * Math.cos(droiteSupportAngle);
    const Ey = E_value * Math.sin(droiteSupportAngle);
    
    // Stocker les données
    diagrammeBlondelDataSaillant = {
        parametres: {
            V, I, phi: phiFinal, psi,
            Rs, lambda: lambdaSaillant, tau: tauSaillant, alpha: alphaSaillant,
            Elr: Elr_value, Etr: Etr_magnitude, E: E_value,
            Jlr, J: J_value,
            phiDeg: phiFinal * 180 / Math.PI,
            psiDeg: psi * 180 / Math.PI,
            typeMachine, typeCouplage, typeCharge, mode,
            angleI, angleE
        },
        vecteurs: {
            V: { x: Vx, y: Vy },
            I: { x: Ix, y: Iy },
            RI: { x: RIx, y: RIy },
            lambdaI: { x: lambdaIx, y: lambdaIy },
            tauI: { x: tauIx, y: tauIy },
            Etr: { x: Etrx, y: Etry },
            Elr: { x: Elrx, y: Elry },
            E: { x: Ex, y: Ey }
        },
        points: {
            O: { x: 0, y: 0 },
            P: { x: Px, y: Py },
            G: { x: Gx, y: Gy },
            T: { x: Tx, y: Ty }
        },
        droiteSupport: {
            angle: droiteSupportAngle,
            pente: Math.tan(droiteSupportAngle)
        }
    };
    
    // Afficher la zone de visualisation
    const zoneVisualisation = document.getElementById('zone-visualisation-saillant');
    if (zoneVisualisation) {
        zoneVisualisation.classList.add('active');
        zoneVisualisation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Mettre à jour le titre
    document.getElementById('titre-diagramme-saillant').textContent = 'Diagramme de Blondel (Pôles Saillants)';
    
    // Peupler les contrôles de vecteurs
    populateVectorControlsSaillant('blondel');
    
    // Démarrer l'animation si activée
    if (currentVisibleSaillant.blondel.Animation) {
        // Dessiner d'abord le diagramme complet
        dessinerDiagrammeBlondelSaillant();
        // Puis démarrer l'animation
        setTimeout(() => replayAnimationSaillant(), 1000);
    } else {
        // Dessiner le diagramme sans animation
        dessinerDiagrammeBlondelSaillant();
    }
    
    // Afficher les résultats (sans J)
    afficherResultatsBlondelSaillant();
}

// Dessiner le diagramme de Blondel pour pôle saillant (avec support pour l'animation)
function dessinerDiagrammeBlondelSaillant(currentAnimationStep = -1) {
    if (!diagrammeBlondelDataSaillant) return;
    
    const canvas = document.getElementById('canvas-diagramme-saillant');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const v = diagrammeBlondelDataSaillant.vecteurs;
    const p = diagrammeBlondelDataSaillant.parametres;
    const pts = diagrammeBlondelDataSaillant.points;
    
    // Calculer les limites
    const tousPoints = [
        {x: 0, y: 0},
        {x: v.V.x, y: v.V.y},
        {x: v.I.x, y: v.I.y},
        {x: v.V.x + v.RI.x, y: v.V.y + v.RI.y},
        {x: pts.P.x, y: pts.P.y},
        {x: pts.G.x, y: pts.G.y},
        {x: pts.T.x, y: pts.T.y},
        {x: v.E.x, y: v.E.y}
    ];
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    tousPoints.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    });
    
    // Ajouter une marge
    const marge = 0.2;
    const deltaX = maxX - minX;
    const deltaY = maxY - minY;
    minX -= deltaX * marge;
    maxX += deltaX * marge;
    minY -= deltaY * marge;
    maxY += deltaY * marge;
    
    // Calculer l'échelle
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const usableWidth = canvasWidth * 0.9;
    const usableHeight = canvasHeight * 0.9;
    
    const scaleX = usableWidth / (maxX - minX);
    const scaleY = usableHeight / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);
    
    // Calculer le décalage pour centrer
    const offsetX = (canvasWidth - (maxX - minX) * scale) / 2 - minX * scale;
    const offsetY = (canvasHeight - (maxY - minY) * scale) / 2 - minY * scale;
    
    // Fonctions de conversion
    function toCanvasX(x) {
        return offsetX + x * scale;
    }
    
    function toCanvasY(y) {
        return canvasHeight - (offsetY + y * scale);
    }
    
    // Dessiner la grille
    ctx.strokeStyle = colorsSaillant.grid;
    ctx.lineWidth = 0.5;
    
    const stepX = (maxX - minX) / 10;
    for (let x = minX; x <= maxX; x += stepX) {
        const canvasX = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, canvasHeight);
        ctx.stroke();
    }
    
    const stepY = (maxY - minY) / 10;
    for (let y = minY; y <= maxY; y += stepY) {
        const canvasY = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(canvasWidth, canvasY);
        ctx.stroke();
    }
    
    // Dessiner les axes
    ctx.strokeStyle = colorsSaillant.axis;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(canvasWidth, toCanvasY(0));
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), canvasHeight);
    ctx.stroke();
    
    // Fonction pour dessiner un vecteur animé
    function dessinerVecteurAnime(x1, y1, x2, y2, couleur, etiquette, progress = 1, style = 'solid', epaisseur = 2) {
        const x1c = toCanvasX(x1);
        const y1c = toCanvasY(y1);
        const x2c = toCanvasX(x1 + (x2 - x1) * progress);
        const y2c = toCanvasY(y1 + (y2 - y1) * progress);
        
        ctx.strokeStyle = couleur;
        ctx.lineWidth = epaisseur;
        ctx.setLineDash(style === 'dashed' ? [5, 5] : style === 'dotted' ? [2, 3] : []);
        
        ctx.beginPath();
        ctx.moveTo(x1c, y1c);
        ctx.lineTo(x2c, y2c);
        ctx.stroke();
        
        // Flèche seulement si le vecteur est complet
        if (progress >= 1) {
            const angle = Math.atan2(y2c - y1c, x2c - x1c);
            const arrowSize = 8;
            
            ctx.fillStyle = couleur;
            ctx.beginPath();
            ctx.moveTo(x2c, y2c);
            ctx.lineTo(x2c - arrowSize * Math.cos(angle - Math.PI / 6), y2c - arrowSize * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2c - arrowSize * Math.cos(angle + Math.PI / 6), y2c - arrowSize * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        }
        
        // Étiquette
        if (etiquette && progress >= 1) {
            const midX = (x1c + x2c) / 2;
            const midY = (y1c + y2c) / 2;
            
            const normalAngle = Math.atan2(y2c - y1c, x2c - x1c) + Math.PI / 2;
            const offset = 15;
            const labelX = midX + offset * Math.cos(normalAngle);
            const labelY = midY + offset * Math.sin(normalAngle);
            
            ctx.fillStyle = couleur;
            ctx.font = "bold 12px IBM Plex Sans";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(etiquette, labelX, labelY);
        }
        
        ctx.setLineDash([]);
    }
    
    // Fonction pour dessiner un point
    function dessinerPoint(x, y, couleur, etiquette) {
        const xc = toCanvasX(x);
        const yc = toCanvasY(y);
        
        ctx.fillStyle = couleur;
        ctx.beginPath();
        ctx.arc(xc, yc, 5, 0, Math.PI * 2);
        ctx.fill();
        
        if (etiquette) {
            ctx.fillStyle = couleur;
            ctx.font = "bold 12px IBM Plex Sans";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(etiquette, xc, yc - 8);
        }
    }
    
    // Fonction pour dessiner une droite
    function dessinerDroite(x1, y1, x2, y2, couleur, style = 'dashed') {
        const x1c = toCanvasX(x1);
        const y1c = toCanvasY(y1);
        const x2c = toCanvasX(x2);
        const y2c = toCanvasY(y2);
        
        ctx.strokeStyle = couleur;
        ctx.lineWidth = 1;
        ctx.setLineDash(style === 'dashed' ? [5, 5] : []);
        
        ctx.beginPath();
        ctx.moveTo(x1c, y1c);
        ctx.lineTo(x2c, y2c);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
    
    // Récupérer les éléments visibles
    const visibleVectors = currentVisibleSaillant.blondel;
    
    // Tracer le diagramme selon les éléments visibles et l'animation
    if (currentAnimationStep >= 0 && isAnimatingSaillant) {
        // Mode animation - dessiner les vecteurs un par un
        for (let i = 0; i <= currentAnimationStep; i++) {
            const vector = animationVectorsSaillant[i];
            if (vector && visibleVectors[vector.name]) {
                dessinerVecteurAnime(
                    vector.from.x, vector.from.y,
                    vector.to.x, vector.to.y,
                    vector.color,
                    vector.name,
                    1, // Progress complet pour les vecteurs déjà animés
                    i === 2 || i === 3 ? 'dashed' : i === 4 ? 'dotted' : 'solid'
                );
            }
        }
        
        // Dessiner le vecteur en cours d'animation
        if (currentAnimationStep < animationVectorsSaillant.length) {
            const currentVector = animationVectorsSaillant[currentAnimationStep];
            if (currentVector && visibleVectors[currentVector.name]) {
                dessinerVecteurAnime(
                    currentVector.from.x, currentVector.from.y,
                    currentVector.to.x, currentVector.to.y,
                    currentVector.color,
                    currentVector.name,
                    0.7, // Progress partiel pour l'animation en cours
                    currentAnimationStep === 2 || currentAnimationStep === 3 ? 'dashed' : 
                    currentAnimationStep === 4 ? 'dotted' : 'solid'
                );
            }
        }
        
        // Dessiner les points de base
        dessinerPoint(0, 0, colorsSaillant.axis, "O");
        dessinerPoint(pts.P.x, pts.P.y, colorsSaillant.lambdaI, "P");
        dessinerPoint(pts.G.x, pts.G.y, colorsSaillant.tauI, "G");
        dessinerPoint(pts.T.x, pts.T.y, colorsSaillant.Etr, "T");
        
    } else {
        // Mode normal - dessiner tous les vecteurs visibles
        dessinerPoint(0, 0, colorsSaillant.axis, "O");
        
        if (visibleVectors.V) dessinerVecteurAnime(0, 0, v.V.x, v.V.y, colorsSaillant.V, "V", 1);
        if (visibleVectors.I) dessinerVecteurAnime(0, 0, v.I.x, v.I.y, colorsSaillant.I, "I", 1);
        if (visibleVectors.RsI) dessinerVecteurAnime(v.V.x, v.V.y, v.V.x + v.RI.x, v.V.y + v.RI.y, colorsSaillant.RI, "R·I", 1, 'dashed');
        if (visibleVectors.lambdaI) dessinerVecteurAnime(v.V.x + v.RI.x, v.V.y + v.RI.y, pts.P.x, pts.P.y, colorsSaillant.lambdaI, "j·λ·I", 1, 'dashed');
        
        dessinerPoint(pts.P.x, pts.P.y, colorsSaillant.lambdaI, "P");
        
        if (visibleVectors.tauI) dessinerVecteurAnime(pts.P.x, pts.P.y, pts.G.x, pts.G.y, colorsSaillant.tauI, "j·τ·I", 1, 'dotted');
        
        dessinerPoint(pts.G.x, pts.G.y, colorsSaillant.tauI, "G");
        
        const droiteLength = Math.sqrt(pts.G.x * pts.G.x + pts.G.y * pts.G.y) * 1.5;
        const G_prolonge_x = pts.G.x * 1.5;
        const G_prolonge_y = pts.G.y * 1.5;
        dessinerDroite(0, 0, G_prolonge_x, G_prolonge_y, colorsSaillant.droiteSupport, 'dashed');
        
        if (visibleVectors.Etr) dessinerVecteurAnime(pts.P.x, pts.P.y, pts.T.x, pts.T.y, colorsSaillant.Etr, "Etr", 1, 'solid');
        
        dessinerPoint(pts.T.x, pts.T.y, colorsSaillant.Etr, "T");
        
        if (visibleVectors.Elr) dessinerVecteurAnime(0, 0, v.Elr.x, v.Elr.y, colorsSaillant.Elr, "Elr", 1, 'solid');
        if (visibleVectors.E) dessinerVecteurAnime(0, 0, v.E.x, v.E.y, colorsSaillant.E, "E", 1, 'solid');
    }
}

// Afficher les résultats du diagramme de Blondel pour pôle saillant (sans J)
function afficherResultatsBlondelSaillant() {
    if (!diagrammeBlondelDataSaillant) return;
    
    const p = diagrammeBlondelDataSaillant.parametres;
    
    const resultatsHTML = `
        <div class="output-item">
            <div class="output-label">Angle φ (V-I)</div>
            <div class="output-value">${p.phiDeg.toFixed(2)}°</div>
        </div>
        <div class="output-item">
            <div class="output-label">Angle ψ (E-I)</div>
            <div class="output-value">${p.psiDeg.toFixed(2)}°</div>
        </div>
        <div class="output-item">
            <div class="output-label">FEM Elr</div>
            <div class="output-value">${p.Elr.toFixed(2)} V</div>
        </div>
        <div class="output-item">
            <div class="output-label">FEM Etr</div>
            <div class="output-value">${p.Etr.toFixed(2)} V</div>
        </div>
        <div class="output-item">
            <div class="output-label">FEM E</div>
            <div class="output-value">${p.E.toFixed(2)} V</div>
        </div>
        <div class="output-item">
            <div class="output-label">Coefficient α</div>
            <div class="output-value">${alphaSaillant.toFixed(4)}</div>
        </div>
        <div class="output-item">
            <div class="output-label">Réactance λ</div>
            <div class="output-value">${lambdaSaillant.toFixed(4)} Ω</div>
        </div>
        <div class="output-item">
            <div class="output-label">Courant Jlr</div>
            <div class="output-value">${p.Jlr.toFixed(2)} A</div>
        </div>
    `;
    
    document.getElementById('resultats-diagramme-saillant').innerHTML = resultatsHTML;
}

// Tracer le diagramme de Diagrammededeuxréactances pour pôle saillant
function tracerDiagrammeDiagrammededeuxréactancesSaillant() {
    diagrammeActuelSaillant = 'Diagrammededeuxréactances';
    
    // Vérifier que Xt et Xl ont été calculés
    if (XtSaillant === 0 || XlSaillant === 0) {
        alert("Veuillez d'abord calculer Xt et Xl à partir de l'essai de glissement.");
        return;
    }
    
    // Récupérer les paramètres
    const typeMachine = document.querySelector('input[name="machine-type-saillant"]:checked').value;
    const Rs = getRsValueSaillant(); // MODIFIÉ: Utiliser la nouvelle fonction
    const V_saisie = parseFloat(document.getElementById('v-saillant').value) || 220;
    const I_saisie = parseFloat(document.getElementById('i-saillant').value) || 10;
    const cosPhi = parseFloat(document.getElementById('cosphi-saillant').value) || 0.8;
    const typeCharge = document.getElementById('nature-saillant').value;
    const donneesVide = getDonneesVideSaillant();
    
    // Vérifier que Rs a été calculée
    if (Rs <= 0) {
        alert("Veuillez d'abord calculer la résistance Rs.");
        return;
    }
    
    // Vérifier les données
    if (V_saisie <= 0 || I_saisie <= 0) {
        alert("Veuillez saisir des valeurs positives pour la tension et le courant.");
        return;
    }
    
    if (cosPhi < 0 || cosPhi > 1) {
        alert("Le facteur de puissance doit être compris entre 0 et 1.");
        return;
    }
    
    // Calcul de K à partir du 2ème point de la caractéristique à vide
    let K_calcul = 0;
    if (donneesVide.length >= 2) {
        // Prendre le 2ème point (index 1) car le 1er est souvent (0,0)
        const point2 = donneesVide[1] || donneesVide[donneesVide.length - 1];
        K_calcul = point2.E / point2.J;
    } else {
        alert("Veuillez saisir au moins 2 points pour la caractéristique à vide.");
        return;
    }
    
    KSaillant = K_calcul; // Stocker pour utilisation ultérieure
    
    // Calcul des valeurs
    let V = V_saisie;
    let I = I_saisie;
    
    // Calculer l'angle φ selon le type de charge
    const phi = Math.acos(cosPhi); // φ est toujours positif (0 à π)
    
    // Déterminer le signe de φ selon le type de charge
    let phiSigne;
    if (typeCharge === "inductive") {
        // Charge inductive : courant en retard sur tension, I avec angle -φ
        phiSigne = -phi;
    } else if (typeCharge === "capacitive") {
        // Charge capacitive : courant en avance sur tension, I avec angle +φ
        phiSigne = phi;
    } else {
        // Charge résistive : courant en phase avec tension
        phiSigne = 0;
    }
    
    // Calcul de l'angle ψ (angle entre V et E)
    // tan(ψ) = (V*sin(φ) + Xt*I) / (V*cos(φ) + Rs*I)
    // Note: On utilise φ (valeur absolue) pour le calcul
    const tanPsi = (V * Math.sin(phi) + XtSaillant * I) / (V * Math.cos(phi) + Rs * I);
    const psi = Math.atan(tanPsi); // ψ est l'angle entre V et l'axe de la droite support
    
    // Calcul de l'angle de charge δ = ψ - φ (pour alternateur)
    // L'angle δ est positif pour un alternateur en charge inductive
    const deltaRad = psi - phi; // δ en radians
    const deltaDeg = deltaRad * 180 / Math.PI; // δ en degrés
    
    // Composantes du courant Id et Iq
    const Id = I * Math.sin(psi); // Composante directe (sur l'axe d)
    const Iq = I * Math.cos(psi); // Composante en quadrature (sur l'axe q)
    
    // FEM E finale (Formule de Diagrammededeuxréactances pour pôles saillants)
    const E = Math.sqrt(
        Math.pow(V * Math.cos(deltaRad) + Rs * Iq + XlSaillant * Id, 2) +
        Math.pow(V * Math.sin(deltaRad) + Rs * Id - XtSaillant * Iq, 2)
    );
    
    // Calcul du courant d'excitation J (E = K*J, linéaire)
    const J = E / KSaillant;
    
    // Stocker les paramètres
    lastTwoReactanceParamsSaillant = [V, I, phiSigne, psi, deltaRad, Rs, XtSaillant, XlSaillant, E, J, typeCharge];
    
    // Afficher la zone de visualisation
    const zoneVisualisation = document.getElementById('zone-visualisation-saillant');
    if (zoneVisualisation) {
        zoneVisualisation.classList.add('active');
        zoneVisualisation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Mettre à jour le titre
    document.getElementById('titre-diagramme-saillant').textContent = 'Diagramme Diagrammededeuxréactances (Pôles Saillants)';
    
    // Peupler les contrôles de vecteurs
    populateVectorControlsSaillant('Diagrammededeuxréactances');
    
    // Démarrer l'animation si activée
    if (currentVisibleSaillant.Diagrammededeuxréactances.Animation) {
        // Dessiner d'abord le diagramme complet
        drawTwoReactanceSaillant(V, I, phiSigne, psi, deltaRad, Rs, XtSaillant, XlSaillant, E, typeCharge);
        // Puis démarrer l'animation
        setTimeout(() => replayAnimationSaillant(), 1000);
    } else {
        // Dessiner le diagramme sans animation
        drawTwoReactanceSaillant(V, I, phiSigne, psi, deltaRad, Rs, XtSaillant, XlSaillant, E, typeCharge);
    }
    
    // Afficher les résultats (sans J)
    afficherResultatsDiagrammededeuxréactancesSaillant(V, I, phi, psi, deltaDeg, Rs, XtSaillant, XlSaillant, typeMachine, typeCharge);
}

// Dessiner le diagramme de Diagrammededeuxréactances pour pôle saillant (avec support pour l'animation)
function drawTwoReactanceSaillant(V, I, phiSigne, psi, delta, Rs, Xt, Xl, E, typeCharge, currentAnimationStep = -1) {
    const canvas = document.getElementById('canvas-diagramme-saillant');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Coordonnées clés
    // Tension V sur l'axe horizontal réel
    const Vx = V;
    const Vy = 0;
    
    // Courant I avec le déphasage correct
    const Ix = I * Math.cos(phiSigne);
    const Iy = I * Math.sin(phiSigne);
    
    // Chute ohmique Rs·I (même direction que I)
    const RsIx = Rs * I * Math.cos(phiSigne);
    const RsIy = Rs * I * Math.sin(phiSigne);
    
    // Chute réactive transversale j·Xt·I (perpendiculaire à I, +90°)
    const XtIx = -Xt * I * Math.sin(phiSigne);
    const XtIy = Xt * I * Math.cos(phiSigne);
    
    // Point auxiliaire A = V + Rs·I + j·Xt·I
    const Ax = Vx + RsIx + XtIx;
    const Ay = Vy + RsIy + XtIy;
    
    // Droite support de l'axe direct (d) passant par O et A
    const angleSupport = Math.atan2(Ay, Ax);
    
    // Composantes directe et transversale du courant
    const Id = I * Math.sin(psi);
    const Iq = I * Math.cos(psi);
    
    // Chute due à la différence des réactances j·(Xl - Xt)·Id
    const deltaX = Xl - Xt;
    const deltaXId_x = -deltaX * Id * Math.sin(angleSupport);
    const deltaXId_y = deltaX * Id * Math.cos(angleSupport);
    
    // FEM E (sur l'axe d)
    const Ex = E * Math.cos(angleSupport);
    const Ey = E * Math.sin(angleSupport);
    
    // Zoom automatique pour afficher tous les points
    const pts = [
        {x: 0, y: 0},
        {x: Vx, y: Vy},
        {x: Ix, y: Iy},
        {x: Vx + RsIx, y: Vy + RsIy},
        {x: Ax, y: Ay},
        {x: Ex, y: Ey}
    ];
    
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    pts.forEach(p => {
        xmin = Math.min(xmin, p.x);
        xmax = Math.max(xmax, p.x);
        ymin = Math.min(ymin, p.y);
        ymax = Math.max(ymax, p.y);
    });
    
    // Ajouter une marge de 20%
    const marge = 0.2;
    const dx = xmax - xmin || 1;
    const dy = ymax - ymin || 1;
    xmin -= dx * marge;
    xmax += dx * marge;
    ymin -= dy * marge;
    ymax += dy * marge;
    
    // Calcul de l'échelle
    const scaleX = canvas.width / (xmax - xmin);
    const scaleY = canvas.height / (ymax - ymin);
    const scale = Math.min(scaleX, scaleY) * 0.9;
    
    // Origine du repère au centre du canvas
    const ox = canvas.width / 2 - (xmin + xmax) * scale / 2;
    const oy = canvas.height / 2 + (ymin + ymax) * scale / 2;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fonction pour dessiner un vecteur animé
    function dessinerVecteurAnime(x1, y1, x2, y2, couleur, label, progress = 1, style = 'solid', epaisseur = 2) {
        const x1c = ox + x1 * scale;
        const y1c = oy - y1 * scale;
        const x2c = ox + (x1 + (x2 - x1) * progress) * scale;
        const y2c = oy - (y1 + (y2 - y1) * progress) * scale;
        
        ctx.save();
        ctx.strokeStyle = couleur;
        ctx.lineWidth = epaisseur;
        
        if (style === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (style === 'dotted') {
            ctx.setLineDash([2, 3]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(x1c, y1c);
        ctx.lineTo(x2c, y2c);
        ctx.stroke();
        
        // Flèche seulement si le vecteur est complet
        if (progress >= 1) {
            const angle = Math.atan2(y2c - y1c, x2c - x1c);
            const arrowSize = 10;
            
            ctx.fillStyle = couleur;
            ctx.beginPath();
            ctx.moveTo(x2c, y2c);
            ctx.lineTo(x2c - arrowSize * Math.cos(angle - Math.PI / 6), y2c - arrowSize * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2c - arrowSize * Math.cos(angle + Math.PI / 6), y2c - arrowSize * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        }
        
        // Label seulement si le vecteur est complet
        if (label && progress >= 1) {
            const midX = (x1c + x2c) / 2;
            const midY = (y1c + y2c) / 2;
            
            const normalAngle = Math.atan2(y2c - y1c, x2c - x1c) + Math.PI / 2;
            const offset = 15;
            const labelX = midX + offset * Math.cos(normalAngle);
            const labelY = midY + offset * Math.sin(normalAngle);
            
            ctx.fillStyle = couleur;
            ctx.font = "bold 14px IBM Plex Sans";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, labelX, labelY);
        }
        
        ctx.restore();
    }
    
    // Dessiner la grille
    ctx.save();
    ctx.strokeStyle = colorsDiagrammededeuxréactances.grid;
    ctx.lineWidth = 0.5;
    
    // Lignes verticales
    const stepX = 50 / scale;
    for (let x = Math.ceil(xmin / stepX) * stepX; x <= xmax; x += stepX) {
        const canvasX = ox + x * scale;
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, canvas.height);
        ctx.stroke();
    }
    
    // Lignes horizontales
    const stepY = 50 / scale;
    for (let y = Math.ceil(ymin / stepY) * stepY; y <= ymax; y += stepY) {
        const canvasY = oy - y * scale;
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(canvas.width, canvasY);
        ctx.stroke();
    }
    ctx.restore();
    
    // Dessiner les axes
    ctx.save();
    ctx.strokeStyle = colorsDiagrammededeuxréactances.axis;
    ctx.lineWidth = 1;
    
    // Axe des X
    ctx.beginPath();
    ctx.moveTo(ox + xmin * scale, oy);
    ctx.lineTo(ox + xmax * scale, oy);
    ctx.stroke();
    
    // Axe des Y
    ctx.beginPath();
    ctx.moveTo(ox, oy - ymin * scale);
    ctx.lineTo(ox, oy - ymax * scale);
    ctx.stroke();
    
    // Flèches
    const arrowSize = 8;
    
    // Flèche axe X
    ctx.beginPath();
    ctx.moveTo(ox + xmax * scale, oy);
    ctx.lineTo(ox + xmax * scale - arrowSize, oy - arrowSize/2);
    ctx.lineTo(ox + xmax * scale - arrowSize, oy + arrowSize/2);
    ctx.closePath();
    ctx.fillStyle = colorsDiagrammededeuxréactances.axis;
    ctx.fill();
    
    // Flèche axe Y
    ctx.beginPath();
    ctx.moveTo(ox, oy - ymax * scale);
    ctx.lineTo(ox - arrowSize/2, oy - ymax * scale + arrowSize);
    ctx.lineTo(ox + arrowSize/2, oy - ymax * scale + arrowSize);
    ctx.closePath();
    ctx.fill();
    
    // Labels des axes
    ctx.fillStyle = colorsDiagrammededeuxréactances.text;
    ctx.font = "12px IBM Plex Sans";
    ctx.textAlign = "center";
    ctx.fillText("Re", ox + xmax * scale - 20, oy + 15);
    ctx.fillText("Im", ox + 15, oy - ymax * scale + 20);
    
    ctx.restore();
    
    // Récupérer les éléments visibles
    const visibleVectors = currentVisibleSaillant.Diagrammededeuxréactances;
    
    // Dessiner l'origine
    ctx.save();
    ctx.fillStyle = colorsDiagrammededeuxréactances.axis;
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "bold 12px IBM Plex Sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("O", ox, oy - 8);
    ctx.restore();
    
    if (currentAnimationStep >= 0 && isAnimatingSaillant) {
        // Mode animation - dessiner les vecteurs un par un
        for (let i = 0; i <= currentAnimationStep; i++) {
            const vector = animationVectorsSaillant[i];
            if (vector && visibleVectors[vector.name]) {
                dessinerVecteurAnime(
                    vector.from.x, vector.from.y,
                    vector.to.x, vector.to.y,
                    vector.color,
                    vector.name,
                    1, // Progress complet
                    i === 2 || i === 3 ? 'dashed' : 'solid'
                );
            }
        }
        
        // Dessiner le vecteur en cours d'animation
        if (currentAnimationStep < animationVectorsSaillant.length) {
            const currentVector = animationVectorsSaillant[currentAnimationStep];
            if (currentVector && visibleVectors[currentVector.name]) {
                dessinerVecteurAnime(
                    currentVector.from.x, currentVector.from.y,
                    currentVector.to.x, currentVector.to.y,
                    currentVector.color,
                    currentVector.name,
                    0.7, // Progress partiel
                    currentAnimationStep === 2 || currentAnimationStep === 3 ? 'dashed' : 'solid'
                );
            }
        }
    } else {
        // Mode normal - dessiner tous les vecteurs visibles
        if (visibleVectors.V) dessinerVecteurAnime(0, 0, Vx, Vy, colorsDiagrammededeuxréactances.V, "V", 1);
        if (visibleVectors.I) dessinerVecteurAnime(0, 0, Ix, Iy, colorsDiagrammededeuxréactances.I, "I", 1);
        if (visibleVectors.RsI) dessinerVecteurAnime(Vx, Vy, Vx + RsIx, Vy + RsIy, colorsDiagrammededeuxréactances.RsI, "Rs·I", 1, 'dashed');
        if (visibleVectors.XtI) dessinerVecteurAnime(Vx + RsIx, Vy + RsIy, Ax, Ay, colorsDiagrammededeuxréactances.XtI, "j·Xt·I", 1, 'dashed');
        if (visibleVectors.jXlXtId) dessinerVecteurAnime(Ax, Ay, Ex, Ey, colorsDiagrammededeuxréactances.jXlXtId, "j·(Xl-Xt)·Id", 1);
        if (visibleVectors.E) dessinerVecteurAnime(0, 0, Ex, Ey, colorsDiagrammededeuxréactances.E, "E", 1);
    }
    
    // Dessiner la droite support (axe d)
    const longueurDroite = Math.max(Math.abs(xmax), Math.abs(ymax)) * 1.5;
    const dxSupport = longueurDroite * Math.cos(angleSupport);
    const dySupport = longueurDroite * Math.sin(angleSupport);
    
    ctx.save();
    ctx.strokeStyle = "#795548";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + dxSupport * scale, oy - dySupport * scale);
    ctx.stroke();
    ctx.restore();
}

// Afficher les résultats du diagramme de Diagrammededeuxréactances pour pôle saillant (sans J)
function afficherResultatsDiagrammededeuxréactancesSaillant(V, I, phi, psi, deltaDeg, Rs, Xt, Xl, typeMachine, typeCharge) {
    const psiDeg = psi * 180 / Math.PI;
    const phiDeg = phi * 180 / Math.PI;
    
    // Composantes du courant Id et Iq
    const Id = I * Math.sin(psi);
    const Iq = I * Math.cos(psi);
    
    // Calcul de la puissance
    const S = V * I * (typeMachine === 'triphase' ? Math.sqrt(3) : 1);
    const P = S * Math.cos(phi);
    const Q = S * Math.sin(phi);
    
    // Signe de Q selon le type de charge
    const Q_signe = typeCharge === 'inductive' ? Q : -Q;
    
    const resultatsHTML = `
        <div class="output-item">
            <div class="output-label">Angle de charge δ</div>
            <div class="output-value">${deltaDeg.toFixed(2)}°</div>
        </div>
        <div class="output-item">
            <div class="output-label">Angle φ (V-I)</div>
            <div class="output-value">${phiDeg.toFixed(2)}°</div>
        </div>
        <div class="output-item">
            <div class="output-label">Angle ψ (V-axe d)</div>
            <div class="output-value">${psiDeg.toFixed(2)}°</div>
        </div>
        <div class="output-item">
            <div class="output-label">Courant direct Id</div>
            <div class="output-value">${Id.toFixed(2)} A</div>
        </div>
        <div class="output-item">
            <div class="output-label">Courant quadrature Iq</div>
            <div class="output-value">${Iq.toFixed(2)} A</div>
        </div>
        <div class="output-item">
            <div class="output-label">Puissance active P</div>
            <div class="output-value">${P.toFixed(2)} W</div>
        </div>
        <div class="output-item">
            <div class="output-label">Puissance réactive Q</div>
            <div class="output-value">${Q_signe.toFixed(2)} VAR</div>
        </div>
        <div class="output-item">
            <div class="output-label">Réactance Xt</div>
            <div class="output-value">${Xt.toFixed(2)} Ω</div>
        </div>
        <div class="output-item">
            <div class="output-label">Réactance Xl</div>
            <div class="output-value">${Xl.toFixed(2)} Ω</div>
        </div>
    `;
    
    document.getElementById('resultats-diagramme-saillant').innerHTML = resultatsHTML;
}

// Fonction d'interpolation pour pôle saillant
function interpolerValeurSaillant(valeur, donnees, champX, champY) {
    if (donnees.length < 2) return valeur;
    
    const donneesTriees = [...donnees].sort((a, b) => a[champX] - b[champX]);
    
    if (valeur <= donneesTriees[0][champX]) {
        return donneesTriees[0][champY];
    }
    if (valeur >= donneesTriees[donneesTriees.length - 1][champX]) {
        return donneesTriees[donneesTriees.length - 1][champY];
    }
    
    for (let i = 0; i < donneesTriees.length - 1; i++) {
        if (valeur >= donneesTriees[i][champX] && valeur <= donneesTriees[i + 1][champX]) {
            const x1 = donneesTriees[i][champX];
            const y1 = donneesTriees[i][champY];
            const x2 = donneesTriees[i + 1][champX];
            const y2 = donneesTriees[i + 1][champY];
            
            return y1 + (valeur - x1) * (y2 - y1) / (x2 - x1);
        }
    }
    
    return valeur;
}

// Calcul du courant d'excitation J pour pôle saillant
function calculerCourantExcitationJSaillant() {
    if (diagrammeActuelSaillant === 'blondel') {
        calculerCourantExcitationJBlondelSaillant();
    } else if (diagrammeActuelSaillant === 'Diagrammededeuxréactances') {
        calculerCourantExcitationJDiagrammededeuxréactancesSaillant();
    } else {
        alert("Veuillez d'abord tracer un diagramme (Blondel ou Diagrammededeuxréactances).");
    }
}

function calculerCourantExcitationJBlondelSaillant() {
    if (!diagrammeBlondelDataSaillant) {
        alert("Veuillez d'abord tracer le diagramme de Blondel.");
        return;
    }
    
    const p = diagrammeBlondelDataSaillant.parametres;
    const I = p.I;
    const psi = p.psi;
    
    const termeAlpha = alphaSaillant * I * Math.sin(psi);
    const J = p.Jlr + termeAlpha;
    
    const cadreCourantJ = document.getElementById('cadre-courant-J-saillant');
    cadreCourantJ.style.display = 'block';
    
    const calculEtapes = document.getElementById('calcul-etapes-saillant');
    calculEtapes.innerHTML = `
        <div class="etape-calcul">
            <div class="etape-label">1. Courant Jlr (à partir de Elr et caractéristique à vide) :</div>
            <div class="etape-valeur">Jlr = ${p.Jlr.toFixed(2)} A</div>
        </div>
        <div class="etape-calcul">
            <div class="etape-label">2. Calcul de α·I·sin(ψ) :</div>
            <div class="etape-valeur">α·I·sin(ψ) = ${alphaSaillant.toFixed(4)} · ${I.toFixed(2)} · ${Math.sin(psi).toFixed(4)}</div>
            <div class="etape-valeur">α·I·sin(ψ) = ${termeAlpha.toFixed(2)} A</div>
        </div>
        <div class="etape-calcul">
            <div class="etape-label">3. Courant d'excitation total J :</div>
            <div class="etape-valeur">J = Jlr + α·I·sin(ψ) = ${p.Jlr.toFixed(2)} + ${termeAlpha.toFixed(2)}</div>
            <div class="etape-valeur">J = ${J.toFixed(2)} A</div>
        </div>
    `;
    
    document.getElementById('valeur-courant-J-saillant').textContent = `${J.toFixed(2)} A`;
    cadreCourantJ.scrollIntoView({ behavior: 'smooth' });
}

function calculerCourantExcitationJDiagrammededeuxréactancesSaillant() {
    if (lastTwoReactanceParamsSaillant.length === 0) {
        alert("Veuillez d'abord tracer le diagramme de Diagramme de deux réactances.");
        return;
    }
    
    const [V, I, phiSigne, psi, deltaRad, Rs, Xt, Xl, E, J] = lastTwoReactanceParamsSaillant;
    
    const cadreCourantJ = document.getElementById('cadre-courant-J-saillant');
    cadreCourantJ.style.display = 'block';
    
    const calculEtapes = document.getElementById('calcul-etapes-saillant');
    calculEtapes.innerHTML = `
        <div class="etape-calcul">
            <div class="etape-label">1. Calcul de la FEM E (formule de Diagramme de deux réactances) :</div>
            <div class="etape-valeur">E = √[(V·cosδ + Rs·Iq + Xl·Id)² + (V·sinδ + Rs·Id - Xt·Iq)²]</div>
            <div class="etape-valeur">Id = I·sin(ψ) = ${I.toFixed(2)} · ${Math.sin(psi).toFixed(4)} = ${(I * Math.sin(psi)).toFixed(2)} A</div>
            <div class="etape-valeur">Iq = I·cos(ψ) = ${I.toFixed(2)} · ${Math.cos(psi).toFixed(4)} = ${(I * Math.cos(psi)).toFixed(2)} A</div>
            <div class="etape-valeur">E = ${E.toFixed(2)} V</div>
        </div>
        <div class="etape-calcul">
            <div class="etape-label">2. Relation linéaire E = K·J :</div>
            <div class="etape-valeur">K = ${KSaillant.toFixed(2)} V/A (pente caractéristique à vide)</div>
            <div class="etape-valeur">J = E / K = ${E.toFixed(2)} / ${KSaillant.toFixed(2)}</div>
        </div>
        <div class="etape-calcul">
            <div class="etape-label">3. Courant d'excitation J :</div>
            <div class="etape-valeur">J = ${J.toFixed(2)} A</div>
        </div>
    `;
    
    document.getElementById('valeur-courant-J-saillant').textContent = `${J.toFixed(2)} A`;
    cadreCourantJ.scrollIntoView({ behavior: 'smooth' });
}

// Fonction pour fermer le diagramme pôle saillant
function closeDiagramSaillant() {
    const diagramDisplay = document.getElementById('zone-visualisation-saillant');
    if (diagramDisplay) {
        diagramDisplay.classList.remove('active');
    }
    
    // Masquer la barre d'animation
    const animationBar = document.getElementById('animation-bar-saillant');
    if (animationBar) {
        animationBar.style.display = 'none';
    }
    
    // Arrêter l'animation si elle est en cours
    stopAnimationSaillant();
}
