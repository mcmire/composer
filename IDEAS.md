
# Ideas

## Rule-based machine learning

The generated sequence is the "hypothesis", the actions the user takes to
correct the sequence is the "error delta". The correction for a sequence is
stored with the sequence itself.

The idea is that based on the sequences generated and their corrections, we
build up a list of rules that is used to generate future sequences.

Rules are collected in a separate collection called "rules". This represents the
current snapshot of the system.

When an action is taken on a sequence, clear all rules and then generate a new
set of rules by taking the last 7 sequences generated (this is a simulation of
how we as humans can only remember the last 7 things) and comparing them to the
current set of rules. Look at the sequences after correction as well as the
corrections themselves. Is there a pattern we can detect among them?

A rule may be confirmed multiple times by multiple sequences, so we associate
how many times a rule has received confirmation. The system then uses all the
rules as filters or conditions when generating a new sequence. A rule must be
confirmed 3 times before it will be used. Some rules may not apply when
generating a sequence and that is okay. However, some rules that match may
conflict with each other. In this case, the rule which has received more
confirmations wins, unless there is a tie, in which case a random rule is
chosen.

With little data in the system, the rules generated are very general. As the
system gets more data, these general rules are replaced with more refined
versions.

So here's a problem: when we analyze things we don't actually commit entire
patterns to memory perfectly, we tend to have a "fuzzy memory" of things.
How can our system simulate this?

Well, with little data, the system can't really remember exact sequences very
well. It may know how long the sequence was, and it may remember certain
parts of the sequence better than other (e.g. repeated beats) but otherwise
there is nothing to hook onto. In other words, we have to teach the
system how to analyze a sequence -- what is important and what is not
important. As the system builds rules, it can use these rules to make educated
guesses about what parts of a sequence might be based on surrounding beats.

Hence, with a fuzzy memory, the analysis of a thing replaces the exact
representation of the thing itself. With more data, analyses become more
detailed. By analysis I mean the thing, such as a sequence of cells, is broken
down into subsequences. Hence, cells and subsequences are replaced with
probabilities. A part of a sequence or a cell itself can be replaced with
alternatives without changing the validity of the entire sequence.

This of course means that 1) the validity of a sequence must be quantifiable
(sequences must be rateable) and 2) the system must be able to compare a
sequence to another and judge its similiarity. A high degree of similarity on
the subsequence level means that they're related.

## Probablity-based machine learning

The idea here is that the board is a matrix of probabilities. There are three
possible states for each cell:

a) Start a new beat
b) End a running beat
c) Do nothing - if a beat is running this lets it run, if a beat is not
   running then nothing happens.

For instance, if # of ticks is 4 and # of tracks is 2 then the matrix looks
like this:

    ([ or ] or O)  ([ or ] or O)  ([ or ] or O)  ([ or ] or O)
    ([ or ] or O)  ([ or ] or O)  ([ or ] or O)  ([ or ] or O)

When generating a sequence, the system proceeds left to right, top to down.
The probability for each cell depends on the probability of the previous
cells, or the previous group of cells.

## Mutation

If the system generates new sequences purely from probability, eventually it
will run out of new sequences to generate because the probabilities will
converge as what the system generates approaches what the user wants.
This is not necessarily a bad thing, but there are a lot of combinations even
for a 16-tick measure. Therefore, periodically it needs to change the rules and
try out new possibilities. To do this, there are a number of techniques it can
apply:

* Add a beat in between two others
* Split a beat
* Remove a beat
* Replace a section of the sequence with something new

