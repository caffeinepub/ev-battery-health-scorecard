import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type Section = {
    checkedItems : [Bool];
    score : Nat;
    notes : Text;
  };

  type Scorecard = {
    technicianName : Text;
    date : Text;
    vehicleId : Text;
    vin : Text;
    safetyCheck : Section;
    customerIssue : Section;
    visualInspection : Section;
    electricalHealth : Section;
    bmsDiagnostics : Section;
    thermalCheck : Section;
    repairQuality : Section;
    finalPerformance : Section;
    redFlags : [Text];
    status : Text; // "Approved", "Hold", "Repair Required"
    signature : Text;
    totalScore : Nat;
  };

  module Scorecard {
    public func compare(card1 : Scorecard, card2 : Scorecard) : Order.Order {
      Text.compare(card1.date, card2.date);
    };
  };

  let scorecards = Map.empty<Nat, Scorecard>();
  var nextScorecardId = 0;

  func calculateTotalScore(card : Scorecard) : Nat {
    card.safetyCheck.score
    + card.customerIssue.score
    + card.visualInspection.score
    + card.electricalHealth.score
    + card.bmsDiagnostics.score
    + card.thermalCheck.score
    + card.repairQuality.score
    + card.finalPerformance.score;
  };

  public shared ({ caller }) func createScorecard(card : Scorecard) : async Nat {
    let totalScore = calculateTotalScore(card);

    let id = nextScorecardId;
    nextScorecardId += 1;

    let completeCard : Scorecard = {
      card with
      totalScore;
    };

    scorecards.add(id, completeCard);
    id;
  };

  public shared ({ caller }) func updateScorecard(id : Nat, card : Scorecard) : async () {
    if (not scorecards.containsKey(id)) {
      Runtime.trap("Scorecard does not exist");
    };

    let totalScore = calculateTotalScore(card);
    let updatedCard : Scorecard = {
      card with
      totalScore;
    };

    scorecards.add(id, updatedCard);
  };

  public query ({ caller }) func getScorecard(id : Nat) : async Scorecard {
    switch (scorecards.get(id)) {
      case (null) {
        Runtime.trap("Scorecard not found");
      };
      case (?card) {
        card;
      };
    };
  };

  public query ({ caller }) func getAllScorecards() : async [Scorecard] {
    scorecards.values().toArray().sort();
  };

  public shared ({ caller }) func deleteScorecard(id : Nat) : async () {
    if (not scorecards.containsKey(id)) {
      Runtime.trap("Scorecard does not exist");
    };
    scorecards.remove(id);
  };
};
