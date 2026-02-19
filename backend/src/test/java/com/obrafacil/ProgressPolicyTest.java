package com.obrafacil;

import com.obrafacil.domain.model.ProgressPolicy;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ProgressPolicyTest {
  @Test void stageFormula(){ assertEquals(50, ProgressPolicy.stageProgress(4,2)); }
  @Test void projectFormula(){ assertEquals(75, ProgressPolicy.projectProgress(List.of(100,50))); }
}
