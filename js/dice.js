/**
 * LEVIATHAN Dice Engine
 * Handles all roll mechanics tied to character stats
 */

const Dice = {
  /**
   * Get stat modifier from stat value
   * @param {number} stat - Stat value (1-10)
   * @returns {number} Modifier (-2 to +2)
   */
  getModifier(stat) {
    if (stat <= 2) return -2;
    if (stat <= 4) return -1;
    if (stat <= 6) return 0;
    if (stat <= 8) return 1;
    return 2;
  },

  /**
   * Roll a single die
   * @param {number} sides - Number of sides
   * @returns {number} Result
   */
  roll(sides) {
    return Math.floor(Math.random() * sides) + 1;
  },

  /**
   * Roll multiple dice
   * @param {number} count - Number of dice
   * @param {number} sides - Sides per die
   * @returns {number[]} Array of results
   */
  rollMultiple(count, sides) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(this.roll(sides));
    }
    return results;
  },

  /**
   * Perform a stat check (2d6 + modifier)
   * @param {number} stat - Character's stat value
   * @param {number} [bonus=0] - Additional modifier (circumstance, gear, etc)
   * @returns {Object} Roll result with details
   */
  check(stat, bonus = 0) {
    const dice = this.rollMultiple(2, 6);
    const natural = dice[0] + dice[1];
    const modifier = this.getModifier(stat);
    const total = natural + modifier + bonus;

    let outcome;
    let critical = null;

    // Check for criticals first
    if (natural === 12) {
      critical = 'success';
      outcome = 'critical_success';
    } else if (natural === 2) {
      critical = 'failure';
      outcome = 'critical_failure';
    } else if (total >= 12) {
      outcome = 'full_success';
    } else if (total >= 10) {
      outcome = 'success_with_complication';
    } else if (total >= 7) {
      outcome = 'partial_success';
    } else {
      outcome = 'failure';
    }

    return {
      dice,
      natural,
      modifier,
      bonus,
      total,
      outcome,
      critical,
      description: this.describeOutcome(outcome)
    };
  },

  /**
   * Get human-readable outcome description
   * @param {string} outcome - Outcome key
   * @returns {string} Description
   */
  describeOutcome(outcome) {
    const descriptions = {
      critical_success: "CRITICAL SUCCESS — The universe briefly stops hating you.",
      full_success: "FULL SUCCESS — You did the thing. Well done.",
      success_with_complication: "SUCCESS WITH COMPLICATION — You did it, but...",
      partial_success: "PARTIAL SUCCESS — You got something. There's a catch.",
      failure: "FAILURE — The universe reminds you who's in charge.",
      critical_failure: "CRITICAL FAILURE — The universe is laughing."
    };
    return descriptions[outcome] || outcome;
  },

  /**
   * Opposed check between two characters
   * @param {number} stat1 - First character's stat
   * @param {number} stat2 - Second character's stat
   * @returns {Object} Result with both rolls and winner
   */
  opposed(stat1, stat2) {
    const roll1 = this.check(stat1);
    const roll2 = this.check(stat2);

    let winner;
    if (roll1.total > roll2.total) {
      winner = 1;
    } else if (roll2.total > roll1.total) {
      winner = 2;
    } else {
      // Tie goes to higher natural roll
      winner = roll1.natural >= roll2.natural ? 1 : 2;
    }

    return {
      roll1,
      roll2,
      winner,
      margin: Math.abs(roll1.total - roll2.total)
    };
  },

  /**
   * Format a roll result for display
   * @param {Object} result - Roll result from check()
   * @param {string} [statName] - Name of stat used
   * @param {string} [characterName] - Name of character
   * @returns {string} Formatted string
   */
  format(result, statName = 'STAT', characterName = 'Character') {
    const modSign = result.modifier >= 0 ? '+' : '';
    const bonusStr = result.bonus ? ` ${result.bonus >= 0 ? '+' : ''}${result.bonus} bonus` : '';
    
    let output = `[${characterName}] ${statName} CHECK\n`;
    output += `  Rolled: ${result.dice.join(' + ')} = ${result.natural}\n`;
    output += `  Modifier: ${modSign}${result.modifier}${bonusStr}\n`;
    output += `  TOTAL: ${result.total}\n`;
    output += `  → ${result.description}`;
    
    if (result.critical) {
      output = `⚡ ${output}`;
    }
    
    return output;
  }
};

// Export for Node.js / ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dice;
}
