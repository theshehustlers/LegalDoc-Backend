% --- Intelligent Legal Document Categorization Engine ---
% This engine uses a set of rules to categorize documents based on keywords.
% It provides a Category, a Confidence score (0.0 to 1.0), and an Explanation.

% --- HIGH CONFIDENCE RULES (Specific Phrases or Unique Terms) ---

% Matches 'Criminal Law' with high confidence.
categorize(Keywords, 'Criminal Law', 0.95, 'Contains specific criminal law terminology like "prosecution" and "offense".') :-
    member(criminal, Keywords),
    (member(offense, Keywords) ; member(prosecution, Keywords)).

% Matches 'Estate Planning/Will' with high confidence.
categorize(Keywords, 'Estate Planning/Will', 0.95, 'Contains definitive estate planning terms like "testament" and "bequeath".') :-
    (member(testament, Keywords), member(bequeath, Keywords)).

% Matches 'Intellectual Property' with high confidence.
categorize(Keywords, 'Intellectual Property', 0.90, 'Identified key intellectual property terms like "patent" or "copyright".') :-
    (member(patent, Keywords) ; member(copyright, Keywords) ; member(trademark, Keywords)).

% Matches 'Resume/CV' with high confidence (Non-legal document).
categorize(Keywords, 'Resume/CV', 0.95, 'Document contains sections typical of a resume, such as "education" and "experience".') :-
    member(experience, Keywords),
    member(education, Keywords),
    member(skills, Keywords).


% --- MEDIUM CONFIDENCE RULES (Common Legal Terms) ---

% Matches 'Contract/Agreement' with medium confidence.
categorize(Keywords, 'Contract/Agreement', 0.80, 'Contains common contractual terms "agreement" and "party".') :-
    member(agreement, Keywords),
    member(party, Keywords).

% Matches 'Property/Real Estate' with medium confidence.
categorize(Keywords, 'Property/Real Estate', 0.85, 'Contains terms related to property and tenancy like "lease" and "landlord".') :-
    member(lease, Keywords),
    (member(landlord, Keywords) ; member(tenant, Keywords)).

% Matches 'Employment Law' with medium confidence.
categorize(Keywords, 'Employment Law', 0.80, 'Contains standard employment-related terms.') :-
    member(employment, Keywords),
    (member(employee, Keywords) ; member(employer, Keywords)).

% Matches 'Litigation/Court' with medium confidence.
categorize(Keywords, 'Litigation/Court', 0.85, 'Contains terms specific to court proceedings like "plaintiff" and "defendant".') :-
    (member(plaintiff, Keywords), member(defendant, Keywords)).


% --- LOWER CONFIDENCE RULES (Broader Terms) ---

% Matches 'Family Law' with lower confidence.
categorize(Keywords, 'Family Law', 0.70, 'Contains broad family-related legal terms.') :-
    (member(divorce, Keywords) ; member(custody, Keywords) ; member(marriage, Keywords)).

% Matches 'Tax Law' with lower confidence.
categorize(Keywords, 'Tax Law', 0.75, 'Contains financial terms related to taxation.') :-
    member(tax, Keywords),
    member(revenue, Keywords).

% Matches 'Insurance' with lower confidence.
categorize(Keywords, 'Insurance', 0.75, 'Contains terms related to insurance policies.') :-
    member(insurance, Keywords),
    member(policy, Keywords).

% Matches 'Banking/Finance' with lower confidence.
categorize(Keywords, 'Banking/Finance', 0.70, 'Contains general banking or finance terms.') :-
    (member(loan, Keywords) ; member(credit, Keywords)).


% --- DEFAULT FALLBACK RULE ---
% This rule MUST be last. It catches anything that doesn't match above.
categorize(_, 'General Legal Document', 0.30, 'The document does not contain specific keywords to match a defined category.').
