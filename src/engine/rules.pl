% --- Legal Document Categorization Rules ---
% The main predicate is categorize(Keywords, Category).
% It checks if a list of keywords matches the criteria for a specific category.

% --- Specific Document Types ---

% Matches 'Contract/Agreement'
categorize(Keywords, 'Contract/Agreement') :-
    member(agreement, Keywords),
    (member(party, Keywords) ; member(contract, Keywords)).

% Matches 'Property/Real Estate' based on lease or property terms.
categorize(Keywords, 'Property/Real Estate') :-
    (member(lease, Keywords), member(landlord, Keywords), member(tenant, Keywords));
    (member(property, Keywords), member(deed, Keywords)).

% Matches 'Estate Planning/Will'
categorize(Keywords, 'Estate Planning/Will') :-
    (member(testament, Keywords) ; member(will, Keywords)),
    (member(bequeath, Keywords) ; member(estate, Keywords)).

% Matches 'Employment Law'
categorize(Keywords, 'Employment Law') :-
    member(employment, Keywords),
    (member(employee, Keywords) ; member(employer, Keywords)).

% Matches 'Corporate/Business'
categorize(Keywords, 'Corporate/Business') :-
    (member(corporate, Keywords) ; member(business, Keywords)),
    (member(shares, Keywords) ; member(bylaws, Keywords)).

% Matches 'Intellectual Property'
categorize(Keywords, 'Intellectual Property') :-
    member(intellectual, Keywords);
    member(patent, Keywords);
    member(trademark, Keywords);
    member(copyright, Keywords).

% Matches 'Litigation/Court'
categorize(Keywords, 'Litigation/Court') :-
    (member(litigation, Keywords) ; member(lawsuit, Keywords)),
    (member(plaintiff, Keywords) ; member(defendant, Keywords)).

% Matches 'Family Law'
categorize(Keywords, 'Family Law') :-
    member(family, Keywords);
    member(divorce, Keywords);
    member(custody, Keywords);
    member(marriage, Keywords).

% Matches 'Criminal Law'
categorize(Keywords, 'Criminal Law') :-
    member(criminal, Keywords),
    (member(charge, Keywords) ; member(offense, Keywords) ; member(prosecution, Keywords)).

% Matches 'Tax Law'
categorize(Keywords, 'Tax Law') :-
    member(tax, Keywords),
    (member(revenue, Keywords) ; member(deduction, Keywords)).

% Matches 'Insurance'
categorize(Keywords, 'Insurance') :-
    member(insurance, Keywords),
    (member(policy, Keywords) ; member(claim, Keywords)).

% Matches 'Banking/Finance'
categorize(Keywords, 'Banking/Finance') :-
    (member(loan, Keywords) ; member(credit, Keywords) ; member(mortgage, Keywords)),
    (member(finance, Keywords) ; member(bank, Keywords)).

% --- Default Rule ---
% If no other rule above matches, it falls back to this general category.
% This rule MUST be last.
categorize(_, 'General Legal Document').